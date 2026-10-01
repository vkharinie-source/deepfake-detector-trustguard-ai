import re


def analyze_call(caller: str, transcript: str):
    caller = (caller or "").strip()
    transcript = (transcript or "").strip()

    if not caller and not transcript:
        raise ValueError(
            "Caller information or call transcript is required."
        )

    text = f"{caller} {transcript}".lower()

    details = []
    risk_score = 0

    # OTP / password / PIN / CVV
    credential_patterns = [
        r"\botp\b",
        r"one[\s-]?time password",
        r"\bpin\b",
        r"\bcvv\b",
        r"\bpassword\b",
        r"verification code",
        r"tell me.*otp",
        r"share.*otp",
        r"read.*otp",
    ]

    if any(re.search(pattern, text) for pattern in credential_patterns):
        risk_score += 30
        details.append(
            "The caller appears to request an OTP, PIN, password, CVV, or verification code."
        )

    # Banking / payment
    banking_patterns = [
        r"bank account",
        r"credit card",
        r"debit card",
        r"\bupi\b",
        r"payment",
        r"transfer money",
        r"send money",
        r"refund",
        r"transaction",
        r"account number",
    ]

    if any(re.search(pattern, text) for pattern in banking_patterns):
        risk_score += 25
        details.append(
            "The call contains banking, payment, or financial transaction language."
        )

    # Urgency / threats
    urgency_patterns = [
        r"\burgent\b",
        r"\bimmediately\b",
        r"\bact now\b",
        r"\bright now\b",
        r"account.*blocked",
        r"account.*suspended",
        r"account.*closed",
        r"\bpolice\b",
        r"legal action",
        r"court case",
        r"\barrest\b",
    ]

    if any(re.search(pattern, text) for pattern in urgency_patterns):
        risk_score += 20
        details.append(
            "The caller uses urgent, threatening, or fear-based language."
        )

    # Remote access
    remote_patterns = [
        r"install.*app",
        r"download.*app",
        r"remote access",
        r"screen sharing",
        r"share your screen",
        r"\banydesk\b",
        r"\bteamviewer\b",
        r"remote desktop",
    ]

    if any(re.search(pattern, text) for pattern in remote_patterns):
        risk_score += 25
        details.append(
            "The caller may be attempting to obtain remote access to the device."
        )

    # KYC / identity information
    identity_patterns = [
        r"\bkyc\b",
        r"aadhaar",
        r"pan card",
        r"identity proof",
        r"send.*document",
        r"share.*document",
        r"verify your identity",
    ]

    if any(re.search(pattern, text) for pattern in identity_patterns):
        risk_score += 20
        details.append(
            "The caller requests identity or KYC information."
        )

    # Prize / reward scams
    reward_patterns = [
        r"you won",
        r"\bwinner\b",
        r"\blottery\b",
        r"\bprize\b",
        r"cash reward",
        r"free money",
        r"claim.*reward",
    ]

    if any(re.search(pattern, text) for pattern in reward_patterns):
        risk_score += 20
        details.append(
            "The call contains prize, lottery, reward, or unexpected-money claims."
        )

    # Impersonation
    impersonation_patterns = [
        r"calling from your bank",
        r"calling from bank",
        r"from customer care",
        r"from the security department",
        r"from government",
        r"from police",
        r"from income tax",
        r"technical support",
    ]

    if any(re.search(pattern, text) for pattern in impersonation_patterns):
        risk_score += 15
        details.append(
            "The caller claims to represent an organization and should be independently verified."
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
            "No major phone scam indicators were detected."
        )

    if result == "FAKE":
        recommendations = [
            "Do not share OTPs, PINs, passwords, CVV numbers, or banking details.",
            "Do not install remote-access applications at the caller's request.",
            "End the call and contact the organization using its official number.",
            "Report the caller if the conversation appears fraudulent.",
        ]

    elif result == "SUSPICIOUS":
        recommendations = [
            "Verify the caller's identity independently.",
            "Do not share sensitive information during the call.",
            "Contact the organization through an official website or phone number.",
        ]

    else:
        recommendations = [
            "No major scam indicators were detected.",
            "Still avoid sharing sensitive information with unexpected callers.",
        ]

    return {
        "result": result,
        "confidence": round(confidence, 2),
        "risk_score": risk_score,
        "details": details,
        "recommendations": recommendations,
        "caller": caller,
        "transcript": transcript,
    }
