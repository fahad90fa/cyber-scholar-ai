import subprocess
import re
import hashlib
import os
import platform
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class MACSnifferError(Exception):
    """Exception for MAC address sniffer errors"""
    pass


class MACAddressSniffer:
    """
    Low-level MAC address sniffer for Windows, Linux, and macOS.
    Never uses WebRTC, browser APIs, or third-party services.
    """

    @staticmethod
    def get_system_mac() -> Optional[str]:
        """
        Capture system MAC address using platform-specific methods.
        Priority: getmac.exe (Windows) > ip link show (Linux) > networksetup (macOS) > os.networkinterfaces()
        
        Returns:
            MAC address string (e.g., "A1:B2:C3:D4:E5:F6") or None if unable to capture
        """
        system = platform.system()
        logger.info(f"Detecting system: {system}")
        
        try:
            if system == "Windows":
                return MACAddressSniffer._get_mac_windows()
            elif system == "Linux":
                return MACAddressSniffer._get_mac_linux()
            elif system == "Darwin":  # macOS
                return MACAddressSniffer._get_mac_macos()
            else:
                logger.warning(f"Unknown system: {system}, falling back to networkinterfaces")
                return MACAddressSniffer._get_mac_networkinterfaces()
        except MACSnifferError as e:
            logger.error(f"MAC sniffer error: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error capturing MAC: {str(e)}")
            return None

    @staticmethod
    def _get_mac_windows() -> Optional[str]:
        """Windows: Use getmac.exe command"""
        try:
            output = subprocess.check_output(
                ["getmac.exe", "/format", "csv"],
                stderr=subprocess.DEVNULL,
                timeout=5,
                text=True
            )
            
            lines = output.strip().split("\n")
            if len(lines) < 2:
                raise MACSnifferError("Invalid getmac output")
            
            # First data line contains the MAC
            mac_line = lines[1]
            mac_match = re.search(r"([0-9A-Fa-f]{2}(?:[:-][0-9A-Fa-f]{2}){5})", mac_line)
            
            if mac_match:
                mac = mac_match.group(1).upper()
                logger.info(f"Captured MAC (Windows): {mac}")
                return mac
            else:
                raise MACSnifferError("Could not parse getmac output")
        except subprocess.TimeoutExpired:
            raise MACSnifferError("getmac.exe timeout")
        except FileNotFoundError:
            raise MACSnifferError("getmac.exe not found")
        except Exception as e:
            raise MACSnifferError(f"Windows MAC capture failed: {str(e)}")

    @staticmethod
    def _get_mac_linux() -> Optional[str]:
        """Linux: Use ip link show command"""
        try:
            output = subprocess.check_output(
                ["ip", "link", "show"],
                stderr=subprocess.DEVNULL,
                timeout=5,
                text=True
            )
            
            mac_matches = re.findall(r"link/ether\s+([0-9a-f:]{17})", output, re.IGNORECASE)
            
            if mac_matches:
                # Get the first non-loopback interface
                mac = mac_matches[0].upper()
                logger.info(f"Captured MAC (Linux): {mac}")
                return mac
            else:
                raise MACSnifferError("No MAC address found in ip link output")
        except subprocess.TimeoutExpired:
            raise MACSnifferError("ip link show timeout")
        except FileNotFoundError:
            # Fallback to arp -a if ip command not available
            return MACAddressSniffer._get_mac_linux_arp()
        except Exception as e:
            raise MACSnifferError(f"Linux MAC capture failed: {str(e)}")

    @staticmethod
    def _get_mac_linux_arp() -> Optional[str]:
        """Linux fallback: Use arp -a command"""
        try:
            output = subprocess.check_output(
                ["arp", "-a"],
                stderr=subprocess.DEVNULL,
                timeout=5,
                text=True
            )
            
            mac_matches = re.findall(r"([0-9a-f:]{17})", output, re.IGNORECASE)
            
            if mac_matches:
                mac = mac_matches[0].upper()
                logger.info(f"Captured MAC (Linux via arp): {mac}")
                return mac
            else:
                raise MACSnifferError("No MAC address found in arp output")
        except Exception as e:
            raise MACSnifferError(f"Linux ARP fallback failed: {str(e)}")

    @staticmethod
    def _get_mac_macos() -> Optional[str]:
        """macOS: Use networksetup command"""
        try:
            # Get list of all hardware ports
            output = subprocess.check_output(
                ["networksetup", "-listallhardwareports"],
                stderr=subprocess.DEVNULL,
                timeout=5,
                text=True
            )
            
            mac_matches = re.findall(r"Address:\s+([0-9a-f:]{17})", output, re.IGNORECASE)
            
            if mac_matches:
                # Get the first active interface MAC
                mac = mac_matches[0].upper()
                logger.info(f"Captured MAC (macOS): {mac}")
                return mac
            else:
                raise MACSnifferError("No MAC address found in networksetup output")
        except subprocess.TimeoutExpired:
            raise MACSnifferError("networksetup timeout")
        except FileNotFoundError:
            raise MACSnifferError("networksetup command not found")
        except Exception as e:
            raise MACSnifferError(f"macOS MAC capture failed: {str(e)}")

    @staticmethod
    def _get_mac_networkinterfaces() -> Optional[str]:
        """Fallback: Use Python's os.networkinterfaces() (platform-agnostic)"""
        try:
            import os
            
            interfaces = os.popen("ipconfig getmac 2>/dev/null || ip link show 2>/dev/null || ifconfig 2>/dev/null").read()
            mac_match = re.search(r"([0-9a-f:]{17})", interfaces, re.IGNORECASE)
            
            if mac_match:
                mac = mac_match.group(1).upper()
                logger.info(f"Captured MAC (fallback): {mac}")
                return mac
            else:
                raise MACSnifferError("No MAC address found via fallback method")
        except Exception as e:
            raise MACSnifferError(f"Fallback MAC capture failed: {str(e)}")

    @staticmethod
    def generate_checksum(mac: str, user_id: str, secret_key: str) -> str:
        """
        Generate SHA256 checksum for MAC verification.
        
        Args:
            mac: MAC address (e.g., "A1:B2:C3:D4:E5:F6")
            user_id: User ID (UUID)
            secret_key: Secret verification key from environment
            
        Returns:
            SHA256 checksum as hex string
        """
        combined = f"{mac}|{user_id}|{secret_key}"
        checksum = hashlib.sha256(combined.encode()).hexdigest()
        logger.debug(f"Generated checksum for user {user_id}")
        return checksum

    @staticmethod
    def verify_mac(current_mac: str, stored_mac: str, stored_checksum: str, 
                  user_id: str, secret_key: str) -> bool:
        """
        Verify that the current MAC matches the stored MAC using checksum.
        
        Args:
            current_mac: Currently captured MAC address
            stored_mac: MAC address stored in database
            stored_checksum: Checksum stored in database
            user_id: User ID
            secret_key: Secret verification key
            
        Returns:
            True if MAC is valid and matches, False otherwise
        """
        # Normalize MAC addresses (remove colons, uppercase)
        current_normalized = current_mac.replace(":", "").upper()
        stored_normalized = stored_mac.replace(":", "").upper()
        
        if current_normalized != stored_normalized:
            logger.warning(f"MAC mismatch for user {user_id}: {current_mac} != {stored_mac}")
            return False
        
        # Verify checksum
        expected_checksum = MACAddressSniffer.generate_checksum(current_mac, user_id, secret_key)
        
        if expected_checksum != stored_checksum:
            logger.warning(f"Checksum verification failed for user {user_id}")
            return False
        
        logger.info(f"MAC verification successful for user {user_id}")
        return True
