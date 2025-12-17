# MAC Address Capture Explanation

## What MAC Address Is Being Captured?

The system captures the **hardware MAC address of the PRIMARY ACTIVE NETWORK INTERFACE** - which can be:
- **Ethernet (wired)**: eth0, en0, etc.
- **WiFi (wireless)**: wlan0, en1, etc.
- **Docker/Virtual interfaces**: docker0, veth*, etc.
- **Any other active network interface**

## Capture Methods (by priority)

### Linux
1. **`ip link show`** command - Extracts first non-loopback interface MAC
   - Example: `eth0: aa:bb:cc:dd:ee:ff`
   - Logs: "Captured MAC ... from interface 'eth0'"

2. **`/sys/class/net/*/address`** files - Reads directly from sysfs
   - Reads files like `/sys/class/net/eth0/address`
   - Logs: "Captured MAC ... from interface 'eth0'"

3. **`arp -a`** command - Extracts from ARP table

4. **`/proc/net/arp`** file - Reads from proc filesystem

5. **Python socket with fcntl** - Pure Python implementation (no commands)

6. **`ifconfig`** command

7. **`/proc/net/dev`** - Read network device list

8. **Serverless fallback** - Generates stable fingerprint from environment

### Windows
- Uses `getmac.exe` command

### macOS
- Uses `networksetup` command

## How to See Which Interface Was Captured

### In Logs
Look for messages like:
```
Captured MAC (Linux via ip link show): AA:BB:CC:DD:EE:FF from interface 'eth0'
Captured MAC (Linux via /sys/class/net): AA:BB:CC:DD:EE:FF from interface 'wlan0'
```

### All Available Interfaces
Debug logs show all available interfaces:
```
Available network interfaces: eth0, eth1, docker0, veth123456
```

## Important Notes

1. **Not the loopback interface** - `lo` (127.0.0.1) is specifically skipped

2. **First match wins** - The system returns the first non-loopback interface found

3. **Stable across boots** - Hardware MAC addresses don't change (unless you spoof them)

4. **Device fingerprinting** - This MAC is used to:
   - Bind device during registration
   - Verify the same device is accessing the account later
   - Lock access to specific hardware

5. **In Docker/Containers** - May capture Docker's virtual MAC address (docker0, veth*) instead of host's actual network interface

6. **In Serverless** - Falls back to environment-based fingerprint if no real network interfaces available (Vercel, Lambda, etc.)

## Example Scenario

```
User registers on their home computer:
├─ eth0 (Wired Ethernet): AA:BB:CC:DD:EE:FF ✓ CAPTURED
├─ docker0 (Docker): 02:42:AC:11:00:01
└─ lo (Loopback): (skipped)

Later, user tries to log in from same computer:
├─ Captured MAC: AA:BB:CC:DD:EE:FF
├─ Stored MAC: AA:BB:CC:DD:EE:FF
└─ ✓ Verified - Same device!

User tries from different computer:
├─ Captured MAC: 11:22:33:44:55:66
├─ Stored MAC: AA:BB:CC:DD:EE:FF
└─ ✗ Denied - Different device!
```

## Debugging

To see detailed MAC capture logs:

**In application logs, look for:**
1. `"Detecting system: Linux"` - System type
2. `"Available network interfaces: eth0, wlan0, ..."` - All interfaces
3. `"Captured MAC (Linux via ip link show): AA:BB:CC:DD:EE:FF from interface 'eth0'"` - Which interface was captured
4. `"Verifying MAC for user ..."`  - Verification attempt
5. `"MAC verification result ... valid=True"` - Verification outcome

## Command Examples

Check what MAC would be captured on your system:

**Linux:**
```bash
ip link show              # Shows all interfaces and their MACs
cat /sys/class/net/eth0/address    # Direct MAC read
arp -a                    # ARP table
cat /proc/net/arp         # Proc-based ARP
```

**macOS:**
```bash
networksetup -listallhardwareports
ifconfig
```

**Windows:**
```cmd
getmac.exe /format csv
ipconfig /all
```
