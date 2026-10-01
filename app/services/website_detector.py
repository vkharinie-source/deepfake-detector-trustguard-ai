import re
from urllib.parse import urlparse


SUSPICIOUS_TLDS = {
    ".tk", ".ml", ".ga", ".cf", ".gq",
    ".top", ".xyz", ".click", ".buzz",
    ".work", ".zip"
}

SHORTENERS = {
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "is.gd",
    "ow.ly",
    "buff.ly",
    "cutt.ly"
}

SUSPICIOUS_KEYWORDS = {
    "login",
    "verify",
    "verification",
    "secure",
    "account",
    "update",
    "password",
    "wallet",
    "bank",
    "payment",
    "refund",
    "free",
    "reward",
    "prize",
    "claim",
    "bonus",
    "otp",
    "confirm"
}


def analyze_website(url: str):
    url = (url or "").strip()

    if not url:
        raise ValueError("Website URL is required.")

    original_url = url

    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", url):
        url = "https://" + url

    parsed = urlparse(url)

    hostname = (parsed.hostname or "").lower()
    scheme = (parsed.scheme or "").lower()

    if not hostname:
        raise ValueError("Could not identify the website domain.")

    details = []
    recommendations = []
    risk_score = 0

    # HTTPS
    if scheme != "https":
        risk_score += 15
        details.append("The website does not use HTTPS.")
        recommendations.append(
            "Avoid entering sensitive information on a non-HTTPS website."
        )

    # IP address
    ip_pattern = r"^(?:\d{1,3}\.){3}\d{1,3}$"

    if re.match(ip_pattern, hostname):
        risk_score += 30
        details.append(
            "The URL uses a raw IP address instead of a normal domain name."
        )

    # Suspicious TLD
    if any(hostname.endswith(tld) for tld in SUSPICIOUS_TLDS):
        risk_score += 25
        details.append(
            "The domain uses a suspicious-looking top-level domain."
        )

    # URL shortener
    clean_hostname = hostname.removeprefix("www.")

    if clean_hostname in SHORTENERS:
        risk_score += 20
        details.append(
            "The URL uses a link-shortening service that can hide its destination."
        )
        recommendations.append(
            "Expand and verify shortened links before opening them."
        )

    # Suspicious keywords
    keyword_hits = []

    lower_url = original_url.lower()

    for keyword in SUSPICIOUS_KEYWORDS:
        if keyword in lower_url:
            keyword_hits.append(keyword)

    if keyword_hits:
        risk_score += min(25, len(keyword_hits) * 5)
        details.append(
            "The URL contains account, verification, payment, reward, or security-related keywords."
        )

    # Excessive subdomains
    labels = hostname.split(".")

    if len(labels) >= 5:
        risk_score += 15
        details.append(
            "The domain contains an unusually large number of subdomain levels."
        )

    # Very long URL
    if len(original_url) > 150:
        risk_score += 10
        details.append(
            "The URL is unusually long and may contain tracking or obfuscation parameters."
        )

    # @ symbol
    if "@" in original_url:
        risk_score += 25
        details.append(
            "The URL contains an @ symbol that can be used to disguise a destination."
        )

    # Encoded characters
    if "%" in original_url:
        risk_score += 5
        details.append(
            "The URL contains encoded characters that may obscure part of the destination."
        )

    # Brand impersonation indicators
    brands = [
        "paypal",
        "google",
        "microsoft",
        "apple",
        "amazon",
        "facebook",
        "instagram",
        "whatsapp",
        "bank"
    ]

    brand_found = any(brand in hostname for brand in brands)

    if brand_found and (
        hostname.count("-") >= 2
        or len(labels) >= 5
        or any(hostname.endswith(tld) for tld in SUSPICIOUS_TLDS)
    ):
        risk_score += 20
        details.append(
            "The domain contains a recognizable brand name together with other suspicious URL characteristics."
        )

    # Suspicious query parameters
    query = parsed.query.lower()

    sensitive_words = [
        "password",
        "token",
        "otp",
        "verify",
        "login",
        "account"
    ]

    if any(word in query for word in sensitive_words):
        risk_score += 15
        details.append(
            "The URL query contains account or verification-related parameters."
        )

    risk_score = min(risk_score, 100)

    if risk_score >= 60:
        result = "FAKE"
        confidence = min(97, 65 + risk_score * 0.30)

    elif risk_score >= 30:
        result = "SUSPICIOUS"
        confidence = min(92, 58 + risk_score * 0.30)

    else:
        result = "SAFE"
        confidence = min(98, 90 + (30 - risk_score) * 0.20)

    if not details:
        details.append(
            "No major suspicious website indicators were detected."
        )

    if result == "FAKE":
        recommendations.extend([
            "Do not enter passwords, OTPs, banking information, or other sensitive data.",
            "Verify the domain through the organization's official website.",
            "Do not download files from an untrusted website."
        ])

    elif result == "SUSPICIOUS":
        recommendations.extend([
            "Verify the domain before entering personal information.",
            "Avoid submitting passwords or financial information until the website is verified."
        ])

    else:
        recommendations.extend([
            "No major website risk indicators were detected.",
            "Still verify unexpected websites before submitting sensitive information."
        ])

    return {
        "result": result,
        "confidence": round(confidence, 2),
        "risk_score": risk_score,
        "details": details,
        "recommendations": recommendations,
        "url": original_url,
        "domain": hostname,
        "protocol": scheme
    }
