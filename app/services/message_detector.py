import re


def analyze_message(content: str) -> dict:
    """
    Rule-based suspicious message detector.

    Returns:
        result: REAL or FAKE
        confidence: percentage
        risk_score: 0-100
        details: reasons for the classification
        recommendations: safety recommendations
        analyzed_content: original message
    """

    text = (content or "").strip()

    if not text:
        return {
            "result": "REAL",
            "confidence": 0.0,
            "risk_score": 0,
            "details": [],
            "recommendations": [],
            "analyzed_content": text,
        }

    lower_text = text.lower()

    risk_score = 0
    details = []
    recommendations = []

    # ---------------------------------------------------------
    # OTP / PASSWORD / PIN / CVV
    # ---------------------------------------------------------

    credential_patterns = [
        r"\botp\b",
        r"\bone[- ]time password\b",
        r"\bpassword\b",
        r"\bpin\b",
        r"\bcvv\b",
        r"\bverification code\b",
        r"\bsecurity code\b",
        r"\bpasscode\b",
        r"\blogin code\b",
    ]

    credential_found = any(
        re.search(pattern, lower_text)
        for pattern in credential_patterns
    )

    if credential_found:
        risk_score += 25
        details.append(
            "Requests sensitive credentials such as OTP, password, PIN, CVV, or verification code."
        )
        recommendations.append(
            "Never share OTP, password, PIN, CVV, or verification codes."
        )

    # ---------------------------------------------------------
    # BANKING / PAYMENT
    # ---------------------------------------------------------

    banking_patterns = [
        r"\bbank\b",
        r"\baccount\b",
        r"\bcredit card\b",
        r"\bdebit card\b",
        r"\bupi\b",
        r"\bpayment\b",
        r"\brefund\b",
        r"\btransaction\b",
        r"\btransfer\b",
        r"\bwallet\b",
        r"\bnet banking\b",
    ]

    banking_found = any(
        re.search(pattern, lower_text)
        for pattern in banking_patterns
    )

    if banking_found:
        risk_score += 20
        details.append(
            "Contains banking, payment, transaction, or financial activity."
        )
        recommendations.append(
            "Verify financial requests through the official bank or payment application."
        )

    # ---------------------------------------------------------
    # URGENCY / THREAT
    # ---------------------------------------------------------

    urgency_patterns = [
        r"\burgent\b",
        r"\bimmediately\b",
        r"\baction required\b",
        r"\bact now\b",
        r"\bwithin \d+ minutes?\b",
        r"\bwithin \d+ hours?\b",
        r"\baccount will be blocked\b",
        r"\baccount will be suspended\b",
        r"\baccount will be closed\b",
        r"\blast warning\b",
        r"\bfailure to respond\b",
    ]

    urgency_found = any(
        re.search(pattern, lower_text)
        for pattern in urgency_patterns
    )

    if urgency_found:
        risk_score += 20
        details.append(
            "Uses urgency, threats, or pressure to make the user act quickly."
        )
        recommendations.append(
            "Do not make rushed decisions because of threatening or urgent messages."
        )

    # ---------------------------------------------------------
    # REWARD / PRIZE / LOTTERY
    # ---------------------------------------------------------

    reward_patterns = [
        r"\byou won\b",
        r"\byou have won\b",
        r"\bcongratulations\b",
        r"\bprize\b",
        r"\breward\b",
        r"\blottery\b",
        r"\bcash prize\b",
        r"\bfree gift\b",
        r"\bclaim your reward\b",
    ]

    reward_found = any(
        re.search(pattern, lower_text)
        for pattern in reward_patterns
    )

    if reward_found:
        risk_score += 15
        details.append(
            "Contains prize, lottery, reward, or unexpected gift claims."
        )
        recommendations.append(
            "Do not pay money or provide personal information to claim unexpected prizes."
        )

    # ---------------------------------------------------------
    # SUSPICIOUS LINKS
    # ---------------------------------------------------------

    urls = re.findall(
        r"(https?://[^\s]+|www\.[^\s]+)",
        lower_text
    )

    if urls:
        suspicious_url_found = False

        suspicious_shorteners = [
            "bit.ly",
            "tinyurl.com",
            "t.co",
            "goo.gl",
            "is.gd",
            "cutt.ly",
            "shorturl.at",
        ]

        suspicious_keywords = [
            "verify",
            "login",
            "secure",
            "account",
            "update",
            "claim",
            "confirm",
            "wallet",
            "bank",
        ]

        for url in urls:
            for shortener in suspicious_shorteners:
                if shortener in url:
                    suspicious_url_found = True
                    break

            if any(keyword in url for keyword in suspicious_keywords):
                suspicious_url_found = True

        if suspicious_url_found:
            risk_score += 20
            details.append(
                "Contains a suspicious or potentially shortened/credential-related link."
            )
            recommendations.append(
                "Do not open suspicious links. Visit the official website manually instead."
            )
        else:
            risk_score += 5
            details.append(
                "Contains an external link."
            )

    # ---------------------------------------------------------
    # PERSONAL / SENSITIVE INFORMATION
    # ---------------------------------------------------------

    sensitive_patterns = [
        r"\baadhar\b",
        r"\bpan card\b",
        r"\bpassport\b",
        r"\bdate of birth\b",
        r"\bcredit card number\b",
        r"\bdebit card number\b",
        r"\baccount number\b",
    ]

    sensitive_found = any(
        re.search(pattern, lower_text)
        for pattern in sensitive_patterns
    )

    if sensitive_found:
        risk_score += 15
        details.append(
            "Requests or mentions sensitive personal information."
        )
        recommendations.append(
            "Do not share identity or financial information through unverified messages."
        )

    # ---------------------------------------------------------
    # FORWARDING / SHARING PRESSURE
    # ---------------------------------------------------------

    forwarding_patterns = [
        r"\bforward this\b",
        r"\bforward to \d+ people\b",
        r"\bshare this\b",
        r"\bsend this to everyone\b",
        r"\bshare immediately\b",
    ]

    forwarding_found = any(
        re.search(pattern, lower_text)
        for pattern in forwarding_patterns
    )

    if forwarding_found:
        risk_score += 10
        details.append(
            "Pressures the recipient to forward or widely share the message."
        )

    # ---------------------------------------------------------
    # CAP RISK SCORE
    # ---------------------------------------------------------

    risk_score = min(risk_score, 100)

    # ---------------------------------------------------------
    # FINAL CLASSIFICATION
    # ---------------------------------------------------------

    if risk_score >= 35:
        result = "FAKE"
        confidence = min(50.0 + (risk_score * 0.5), 99.0)
    else:
        result = "REAL"
        confidence = min(99.0, 100.0 - (risk_score * 0.5))

    # ---------------------------------------------------------
    # DEFAULT RECOMMENDATION
    # ---------------------------------------------------------

    if not recommendations:
        recommendations.append(
            "No major suspicious patterns were detected. Still verify unexpected messages independently."
        )

    return {
        "result": result,
        "confidence": round(confidence, 2),
        "risk_score": risk_score,
        "details": details,
        "recommendations": recommendations,
        "analyzed_content": text,
    }