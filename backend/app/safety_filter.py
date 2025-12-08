import re
from typing import Tuple


class SafetyFilter:
    ILLEGAL_KEYWORDS = [
        r"ransomware.*creation",
        r"botnet.*creation",
        r"malware.*distribut",
        r"zero-day.*sell",
        r"steal.*credit.*card",
        r"steal.*password",
        r"ddos.*attack.*launch",
        r"phishing.*campaign",
        r"compromise.*government",
        r"hack.*bank",
        r"decrypt.*without.*permission",
        r"crack.*encryption.*for.*crime",
    ]

    ALLOWED_CONTEXT = [
        "educational",
        "learning",
        "lab",
        "practice",
        "legitimate",
        "authorized",
        "permitted",
        "legal",
        "defensive",
        "security research",
        "ctf",
        "hackathon",
        "authorized penetration testing",
        "authorized security assessment",
    ]

    REDIRECT_SUGGESTIONS = {
        "ransomware": "If you want to learn about ransomware defense, I can help you understand how to protect systems and detect ransomware attacks.",
        "malware": "If you're interested in malware analysis for defensive purposes, I can explain how to analyze and mitigate malware threats.",
        "ddos": "If you want to learn about DDoS mitigation and defense strategies, I can explain how to protect services from DDoS attacks.",
        "phishing": "If you want to learn about phishing defense, I can help you understand how to identify and prevent phishing attacks.",
    }

    @classmethod
    def contains_illegal_intent(cls, text: str) -> Tuple[bool, str]:
        """Check if text contains illegal intent"""
        text_lower = text.lower()
        
        for pattern in cls.ILLEGAL_KEYWORDS:
            if re.search(pattern, text_lower, re.IGNORECASE):
                return True, pattern
        
        return False, ""

    @classmethod
    def has_educational_intent(cls, text: str) -> bool:
        """Check if text has educational intent"""
        text_lower = text.lower()
        
        for keyword in cls.ALLOWED_CONTEXT:
            if keyword in text_lower:
                return True
        
        return False

    @classmethod
    def filter_query(cls, query: str) -> Tuple[bool, str]:
        """
        Filter query for safety
        Returns: (is_safe, message_or_redirect)
        """
        is_illegal, pattern = cls.contains_illegal_intent(query)
        
        if not is_illegal:
            return True, query
        
        has_education = cls.has_educational_intent(query)
        
        if has_education:
            return True, query
        
        for keyword, suggestion in cls.REDIRECT_SUGGESTIONS.items():
            if keyword.lower() in query.lower():
                return False, suggestion
        
        return False, "I cannot assist with requests that could facilitate illegal or unethical activities. Please rephrase your question with a focus on defensive security, learning, or authorized security testing."

    @classmethod
    def add_educational_disclaimer(cls, response: str, topic: str) -> str:
        """Add educational disclaimer for sensitive topics"""
        sensitive_topics = ["exploitation", "payload", "reconnaissance", "phishing"]
        
        if any(topic_keyword in topic.lower() for topic_keyword in sensitive_topics):
            disclaimer = """
⚠️ **EDUCATIONAL DISCLAIMER**: This information is provided for educational and authorized security testing purposes only. Unauthorized access to computer systems is illegal. Always ensure you have explicit permission before conducting any security testing. Use this knowledge responsibly and ethically.
"""
            return disclaimer + response
        
        return response
