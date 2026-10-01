import React, { useState, useRef } from 'react';
import { Newspaper, AlertTriangle, RefreshCw } from '../components/Icons';
import ReportActions from '../components/ReportActions';
import { api } from '../services/api';
import { generatePDFReport } from '../utils/pdfReport';
import { tts, stt } from '../utils/voice';
import { transcribeAudioSamples } from '../utils/offlineSpeech';
import { Pause, Play, Square, Volume2 } from 'lucide-react';

const TABS = [
  { key: 'text', label: 'Paste Text' },
  { key: 'image', label: 'Upload Image' },
  { key: 'pdf', label: 'Upload PDF' },
  { key: 'voice', label: 'Dictate Article' },
];

const SUGGESTED_QS = [
  'Explain this news in simple words.',
  'Why is this article unverified?',
  'What is the main claim?',
  'What evidence supports it?',
  'What evidence is missing?',
  'Give me the important points.',
  'What should I be careful about?',
];

const buildArticleSummary = (headline, content) => {
  const sentences = (content.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [])
    .map(sentence => sentence.trim())
    .filter(Boolean)
    .slice(0, 3);
  const excerpt = sentences.join(' ') || content.trim().slice(0, 500);
  const title = headline.trim() ? `The story is titled ${headline.trim()}. ` : '';
  return `${title}The article says: ${excerpt} The claims remain unverified because external news sources were not checked.`;
};

export default function News() {
  const [tab, setTab] = useState('text');
  const [headline, setHeadline] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // OCR state
  const [ocrText, setOcrText] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrMsg, setOcrMsg] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const imageRef = useRef(null);

  // PDF state
  const [pdfText, setPdfText] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfFileName, setPdfFileName] = useState('');

  // Voice input state
  const [voiceText, setVoiceText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [dictationLoading, setDictationLoading] = useState(false);
  const [dictationMessage, setDictationMessage] = useState('');
  const audioCaptureRef = useRef(null);
  const recordingStartedAtRef = useRef(0);

  // AI Chat state
  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatVoiceListening, setChatVoiceListening] = useState(false);

  // AI voice response
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [aiPaused, setAiPaused] = useState(false);

  // Determine which text to analyze
  const getAnalysisText = () => {
    if (tab === 'text') return text;
    if (tab === 'image') return ocrText;
    if (tab === 'pdf') return pdfText;
    if (tab === 'voice') return voiceText;
    return '';
  };

  // ---- Image OCR ----
  const handleImageSelect = async (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      setError('Please upload a valid image (JPG, PNG, WEBP).');
      return;
    }
    setImagePreview(URL.createObjectURL(file));
    setOcrText('');
    setError('');
    setOcrLoading(true);
    try {
      setOcrMsg('Uploading image...');
      await new Promise(r => setTimeout(r, 300));
      setOcrMsg('Reading newspaper...');
      // Dynamic import Tesseract
      const Tesseract = await import('tesseract.js');
      setOcrMsg('Extracting article text...');
      const worker = await Tesseract.createWorker('eng');
      const { data } = await worker.recognize(file);
      await worker.terminate();
      const extracted = data.text?.trim() || '';
      if (!extracted) {
        setOcrMsg('');
        setError('Could not extract text from this image. Try a clearer image or enter the text manually.');
      } else {
        if (data.confidence && data.confidence < 60) {
          setError('Some text could not be read clearly. Please review and edit the extracted text.');
        }
        setOcrText(extracted);
        setOcrMsg('Text extraction complete.');
      }
    } catch (err) {
      setError('OCR failed: ' + (err.message || 'Unknown error'));
      setOcrMsg('');
    } finally {
      setOcrLoading(false);
    }
  };

  // ---- PDF Text Extraction ----
  const handlePdfSelect = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }
    setPdfFileName(file.name);
    setPdfText('');
    setPdfLoading(true);
    setError('');
    try {
      // Read PDF as text — basic extraction using FileReader
      const arrayBuffer = await file.arrayBuffer();
      // Try to extract text from PDF using a simple approach
      const bytes = new Uint8Array(arrayBuffer);
      let raw = '';
      for (let i = 0; i < bytes.length; i++) {
        const ch = bytes[i];
        if (ch >= 32 && ch < 127) raw += String.fromCharCode(ch);
        else if (ch === 10 || ch === 13) raw += '\n';
      }
      // Extract readable content between stream markers or parentheses
      const textChunks = [];
      // Look for text in parentheses (PDF text objects)
      const parenRegex = /\(([^)]{3,})\)/g;
      let match;
      while ((match = parenRegex.exec(raw)) !== null) {
        const chunk = match[1].replace(/\\n/g, '\n').replace(/\\\\/g, '\\').replace(/\\'/g, "'");
        if (chunk.length > 3 && /[a-zA-Z]/.test(chunk)) {
          textChunks.push(chunk);
        }
      }
      const extracted = textChunks.join(' ').replace(/\s+/g, ' ').trim();
      if (extracted.length > 20) {
        setPdfText(extracted);
      } else {
        // Fallback: treat file as text
        const textDecoder = new TextDecoder('utf-8', { fatal: false });
        const decoded = textDecoder.decode(arrayBuffer);
        const clean = decoded.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
        if (clean.length > 50) {
          setPdfText(clean.substring(0, 5000));
        } else {
          setError('Could not extract readable text from this PDF. Try pasting the text manually.');
        }
      }
    } catch (err) {
      setError('PDF extraction failed. Please paste the text manually.');
    } finally {
      setPdfLoading(false);
    }
  };

  // ---- Offline Voice Input ----
  const handleVoiceStart = async () => {
    const AudioContextType = window.AudioContext || window.webkitAudioContext;
    if (!navigator.mediaDevices?.getUserMedia || !AudioContextType || !window.OfflineAudioContext) {
      setError('This browser cannot record microphone audio. Type or paste the article below instead.');
      return;
    }
    setError('');
    setDictationMessage('Requesting microphone access...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContextType();
      await audioContext.resume();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      const silentOutput = audioContext.createGain();
      const chunks = [];
      silentOutput.gain.value = 0;
      processor.onaudioprocess = (event) => {
        chunks.push(new Float32Array(event.inputBuffer.getChannelData(0)));
      };
      source.connect(processor);
      processor.connect(silentOutput);
      silentOutput.connect(audioContext.destination);
      audioCaptureRef.current = { stream, audioContext, source, processor, silentOutput, chunks };
      recordingStartedAtRef.current = Date.now();
      setIsListening(true);
      setDictationMessage('Recording on this device. Speak for at least one second, then select Stop.');
    } catch (error) {
      audioCaptureRef.current?.stream.getTracks().forEach(track => track.stop());
      audioCaptureRef.current = null;
      setDictationMessage('');
      setError(error.name === 'NotAllowedError'
        ? 'Microphone access is blocked. Allow microphone access, or type or paste the article below.'
        : 'Could not start microphone recording. Type or paste the article below instead.');
    }
  };

  const handleVoiceStop = async () => {
    const capture = audioCaptureRef.current;
    if (!capture) return;
    audioCaptureRef.current = null;
    capture.processor.onaudioprocess = null;
    capture.source.disconnect();
    capture.processor.disconnect();
    capture.silentOutput.disconnect();
    capture.stream.getTracks().forEach(track => track.stop());
    setIsListening(false);

    if (Date.now() - recordingStartedAtRef.current < 800) {
      await capture.audioContext.close();
      setDictationMessage('');
      setError('Recording was too short. Speak for at least one second before stopping.');
      return;
    }

    const sampleCount = capture.chunks.reduce((total, chunk) => total + chunk.length, 0);
    if (!sampleCount) {
      await capture.audioContext.close();
      setDictationMessage('');
      setError('No microphone audio was captured. Check your microphone or type the article below.');
      return;
    }

    const recordedSamples = new Float32Array(sampleCount);
    let writeOffset = 0;
    capture.chunks.forEach((chunk) => {
      recordedSamples.set(chunk, writeOffset);
      writeOffset += chunk.length;
    });

    setDictationLoading(true);
    setError('');
    setDictationMessage('Loading the offline speech model. First use may download it...');
    try {
      setDictationMessage('Transcribing audio on this device. The model will download if needed...');
      const output = await transcribeAudioSamples(
        recordedSamples,
        capture.audioContext.sampleRate,
        percent => setDictationMessage(`Downloading offline speech model: ${percent}%`),
      );
      const transcript = String(output.text || '').trim();
      if (!transcript) throw new Error('No speech was detected. Try again or type the article below.');
      setVoiceText(previous => previous ? `${previous} ${transcript}` : transcript);
      setDictationMessage('Transcription complete. Review or edit the text below.');
    } catch (error) {
      setDictationMessage('');
      setError(error.message || 'Offline transcription failed. Type or paste the article below instead.');
    } finally {
      await capture.audioContext.close();
      setDictationLoading(false);
    }
  };

  // ---- Analyze ----
  const handleAnalyze = async () => {
    const content = getAnalysisText();
    if (!content.trim()) {
      setError('Please provide news content to analyze.');
      return;
    }
    setLoading(true); setError(''); setResult(null);
    setChatMsgs([]);
    try {
      setLoadingMsg('Understanding article...');
      await new Promise(r => setTimeout(r, 300));
      setLoadingMsg('Analyzing claims...');
      const data = await api.analyzeNews(headline || 'News Article', content);
      setLoadingMsg('Generating verification report...');
      await new Promise(r => setTimeout(r, 250));

      const enriched = {
        ...data,
        verification_status: 'UNVERIFIED',
        short_summary: buildArticleSummary(headline, content),
        main_claim: headline || 'Not identified by the available analysis.',
        article_text: content,
      };
      setResult(enriched);
    } catch (err) {
      setError(err.message || 'News verification failed.');
    } finally {
      setLoading(false); setLoadingMsg('');
    }
  };

  // ---- AI Chat ----
  const handleAskAI = async (question) => {
    if (!question?.trim() || !result) return;
    const q = question.trim();
    setChatMsgs(prev => [...prev, { role: 'user', text: q }]);
    setChatInput('');
    const indicators = Array.isArray(result.details) && result.details.length
      ? ` The content-risk detector reported: ${result.details.join(' ')}`
      : ' The content-risk detector did not report any scam indicators.';
    setChatMsgs(prev => [...prev, {
      role: 'system',
      text: `This workspace does not have an article fact-checking or question-answering service configured. The article remains UNVERIFIED because no external sources were checked.${indicators}`,
    }]);
  };

  // Voice question
  const handleChatVoiceStart = () => {
    if (!stt.isSupported()) { setError('Speech recognition not supported.'); return; }
    setChatVoiceListening(true);
    stt.start(
      (transcript) => { setChatInput(transcript); },
      () => { setChatVoiceListening(false); },
      () => { setChatVoiceListening(false); }
    );
  };
  const handleChatVoiceStop = () => { stt.stop(); setChatVoiceListening(false); };

  // AI speaks answer
  const handlePlayAIAnswer = (answerText) => {
    if (!tts.isSupported()) {
      setError('Spoken explanations are not supported in this browser.');
      return;
    }
    setAiSpeaking(true);
    setAiPaused(false);
    tts.speak(answerText, () => { setAiSpeaking(false); setAiPaused(false); });
  };
  const handleStopAI = () => { tts.stop(); setAiSpeaking(false); setAiPaused(false); };
  const handleToggleSpeech = () => {
    if (tts.isPaused()) {
      tts.resume();
      setAiPaused(false);
    } else {
      tts.pause();
      setAiPaused(true);
    }
  };

  const buildSimpleExplanation = () => {
    const findings = Array.isArray(result?.details) ? result.details.filter(Boolean) : [];
    const indicators = findings.length
      ? `The content screening noted: ${findings.join('. ')}.`
      : 'The content screening did not return specific scam indicators. That does not confirm the article is true.';
    const score = result?.risk_score !== undefined
      ? `The content risk score is ${result.risk_score} out of 100.`
      : '';
    return `${result?.short_summary || 'No article summary is available.'} In simple words, unverified means this tool did not check the story against outside news sources. It only screens for scam-style wording. ${indicators} ${score} Compare the claims with reliable independent reporting or an official source before sharing.`;
  };

  // Reset
  const handleReset = () => {
    handleStopAI();
    setHeadline(''); setText(''); setResult(null); setError('');
    setOcrText(''); setImagePreview(null); setPdfText(''); setPdfFileName('');
    setVoiceText(''); setChatMsgs([]); setChatInput('');
  };

  // PDF
  const handlePDF = () => {
    if (!result) return;
    generatePDFReport({
      title: 'News Verification Report',
      moduleType: 'News & Newspaper Intelligence',
      result: { ...result, prediction: result.verification_status, confidence: undefined },
      inputInfo: {
        Headline: headline || 'N/A',
        'Source Tab': tab,
        'Content Length': `${getAnalysisText().length} characters`,
        'Verification Status': 'UNVERIFIED - no external source checks performed',
      },
      findings: [
        `Status: ${result.verification_status}`,
        `Risk Level: ${result.risk_level}`,
        result.confidence !== undefined ? `Content detector confidence: ${Number(result.confidence).toFixed(2)}%` : null,
        result.risk_score !== undefined ? `Content risk score: ${result.risk_score}/100` : null,
      ].filter(Boolean),
      extraSections: [
        { title: 'Short Summary', content: result.short_summary },
        { title: 'Main Claim', content: result.main_claim || headline || 'Not identified' },
        chatMsgs.length > 0 ? { title: 'AI Q&A', content: chatMsgs.map(m => `${m.role === 'user' ? 'Q' : 'A'}: ${m.text}`).join('\n') } : null,
      ].filter(Boolean),
      recommendations: result.recommendations || [],
      technicalInfo: { 'Analysis Engine': 'Misinformation Classifier' },
    });
  };

  const vStatus = result?.verification_status || '';
  const statusColors = {
    VERIFIED: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', text: '#34D399' },
    'PARTIALLY VERIFIED': { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', text: '#FBBF24' },
    MISLEADING: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', text: '#F87171' },
    UNVERIFIED: { bg: 'rgba(156,163,175,0.08)', border: 'rgba(156,163,175,0.25)', text: '#9CA3AF' },
  };
  const sc = statusColors[vStatus] || statusColors.UNVERIFIED;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Input Card */}
      <div className="cyber-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Newspaper size={22} color="#818CF8" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#F9FAFB', margin: 0 }}>News & Newspaper Verification</h3>
            <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: 0 }}>Understand, verify and discuss news before you trust or share it.</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '0.45rem 0.85rem', fontSize: '0.78rem', fontWeight: '600', borderRadius: '6px', cursor: 'pointer',
              backgroundColor: tab === t.key ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: tab === t.key ? '#A5B4FC' : '#6B7280',
              border: tab === t.key ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.08)',
              transition: 'all 0.15s ease', fontFamily: 'inherit',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Headline (shared) */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#9CA3AF', marginBottom: '0.35rem' }}>Headline (optional)</label>
          <input type="text" value={headline} onChange={e => setHeadline(e.target.value)} placeholder="Enter the article headline..." className="cyber-input" />
        </div>

        {/* Tab: Paste Text */}
        {tab === 'text' && (
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#9CA3AF', marginBottom: '0.35rem' }}>Article Text</label>
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Paste the full news article or claim text here..." className="cyber-input" rows={6} style={{ resize: 'vertical' }} />
          </div>
        )}

        {/* Tab: Upload Image */}
        {tab === 'image' && (
          <div>
            <div onClick={() => imageRef.current?.click()}
              onDrop={e => { e.preventDefault(); handleImageSelect(e.dataTransfer?.files?.[0]); }}
              onDragOver={e => e.preventDefault()}
              style={{
                border: '2px dashed rgba(99,102,241,0.3)', borderRadius: '10px', padding: '2rem', textAlign: 'center',
                cursor: 'pointer', backgroundColor: 'rgba(99,102,241,0.04)', marginBottom: '1rem',
              }}
            >
              <input ref={imageRef} type="file" accept="image/*" onChange={e => handleImageSelect(e.target.files?.[0])} style={{ display: 'none' }} />
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }} />
              ) : (
                <>
                  <Newspaper size={36} color="#4B5563" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.85rem', color: '#9CA3AF', margin: 0 }}>Click or drag a newspaper/article image (JPG, PNG, WEBP)</p>
                </>
              )}
            </div>

            {ocrLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#0D1424', borderRadius: '8px', marginBottom: '0.75rem' }}>
                <RefreshCw size={16} color="#6366F1" className="animate-spin" />
                <span style={{ fontSize: '0.825rem', color: '#A5B4FC' }}>{ocrMsg}</span>
              </div>
            )}

            {ocrText && (
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#9CA3AF', marginBottom: '0.35rem' }}>Extracted Text (editable)</label>
                <textarea value={ocrText} onChange={e => setOcrText(e.target.value)} className="cyber-input" rows={6} style={{ resize: 'vertical' }} />
              </div>
            )}
          </div>
        )}

        {/* Tab: Upload PDF */}
        {tab === 'pdf' && (
          <div>
            <div onClick={() => document.getElementById('pdf-input')?.click()} style={{
              border: '2px dashed rgba(99,102,241,0.3)', borderRadius: '10px', padding: '2rem', textAlign: 'center',
              cursor: 'pointer', backgroundColor: 'rgba(99,102,241,0.04)', marginBottom: '1rem',
            }}>
              <input id="pdf-input" type="file" accept=".pdf" onChange={e => handlePdfSelect(e.target.files?.[0])} style={{ display: 'none' }} />
              <Newspaper size={36} color="#4B5563" style={{ marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.85rem', color: '#9CA3AF', margin: 0 }}>
                {pdfFileName ? `Document: ${pdfFileName}` : 'Click to upload a PDF newspaper or article'}
              </p>
            </div>

            {pdfLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#0D1424', borderRadius: '8px', marginBottom: '0.75rem' }}>
                <RefreshCw size={16} color="#6366F1" className="animate-spin" />
                <span style={{ fontSize: '0.825rem', color: '#A5B4FC' }}>Extracting text from PDF...</span>
              </div>
            )}

            {pdfText && (
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#34D399', marginBottom: '0.35rem' }}>Document Extracted - Extracted Article</label>
                <textarea value={pdfText} onChange={e => setPdfText(e.target.value)} className="cyber-input" rows={6} style={{ resize: 'vertical' }} />
              </div>
            )}
          </div>
        )}

        {/* Tab: Voice */}
        {tab === 'voice' && (
          <div>
            <p style={{ color: '#9CA3AF', fontSize: '0.8rem', marginBottom: '0.8rem' }}>
              Dictate article text on this device. The offline speech model downloads the first time you use it.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
              {!isListening ? (
                <button onClick={handleVoiceStart} disabled={dictationLoading} className="cyber-button-primary" style={{ padding: '0.65rem 1.25rem' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                  {dictationLoading ? <><RefreshCw size={16} className="animate-spin" /> Preparing transcription...</> : 'Start Dictation'}
                </button>
              ) : (
                <button onClick={handleVoiceStop} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.65rem 1.25rem',
                  fontSize: '0.875rem', fontWeight: '600', borderRadius: '8px', cursor: 'pointer',
                  backgroundColor: 'rgba(239,68,68,0.15)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)',
                  fontFamily: 'inherit', animation: 'pulse 1.5s infinite',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>
                  Listening... Stop
                </button>
              )}
            </div>
            {dictationMessage && (
              <p role="status" style={{ color: '#8DDDD7', fontSize: '0.76rem', marginBottom: '0.8rem' }}>{dictationMessage}</p>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#9CA3AF', marginBottom: '0.35rem' }}>
                {voiceText ? 'Review or edit the transcribed text' : 'Article text'}
              </label>
              <textarea
                value={voiceText}
                onChange={e => setVoiceText(e.target.value)}
                placeholder="Speak your news, or type or paste the article here..."
                className="cyber-input"
                rows={6}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.825rem', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {/* Analyze button */}
        <div style={{ marginTop: '1rem' }}>
          <button className="cyber-button-primary" onClick={handleAnalyze} disabled={loading || isListening || dictationLoading} style={{ padding: '0.65rem 1.5rem' }}>
            {loading ? <><RefreshCw size={16} className="animate-spin" /> Verifying...</> : 'Analyze News'}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="cyber-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <RefreshCw size={32} color="#6366F1" className="animate-spin" style={{ marginBottom: '1rem' }} />
          <p style={{ fontSize: '0.95rem', color: '#E5E7EB', fontWeight: '600' }}>{loadingMsg}</p>
          <p style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '0.25rem' }}>Analyzing claims and verifying content</p>
        </div>
      )}

      {/* Verification Result */}
      {result && !loading && (
        <>
          {/* Report Card */}
          <div className="cyber-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#818CF8', marginBottom: '1.25rem' }}>News Verification Result</h3>

            {/* Status Banner */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.25rem',
              backgroundColor: sc.bg, border: `1px solid ${sc.border}`,
            }}>
              <AlertTriangle size={28} color={sc.text} />
              <div>
                <p style={{ fontSize: '1.4rem', fontWeight: '800', color: sc.text, margin: 0 }}>{vStatus}</p>
                <p style={{ fontSize: '0.8rem', color: '#9CA3AF', margin: '0.15rem 0 0 0' }}>Verification Status</p>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                {result.confidence !== undefined && <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#E5E7EB', margin: 0 }}>{Number(result.confidence).toFixed(2)}%</p>}
                <p style={{ fontSize: '0.7rem', color: '#6B7280', margin: 0 }}>Detector Confidence</p>
                {result.risk_score !== undefined && <p style={{ fontSize: '0.8rem', fontWeight: '600', color: sc.text, marginTop: '0.2rem' }}>Content Risk Score: {result.risk_score}/100</p>}
              </div>
            </div>

            {/* Short Summary */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.72rem', fontWeight: '700', color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>Short Summary</h4>
              <div style={{ backgroundColor: '#0D1424', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize: '0.875rem', color: '#D1D5DB', lineHeight: '1.7', margin: 0 }}>{result.short_summary}</p>
              </div>
            </div>

            <section className="news-voice-help" aria-label="Spoken news explanation">
              <div className="news-voice-copy">
                <span className="news-voice-icon"><Volume2 size={19} /></span>
                <div>
                  <h4>Need help understanding this news?</h4>
                  <p>Listen to a short reading of the article and what the unverified result means.</p>
                </div>
              </div>
              <div className="news-voice-controls">
                {!aiSpeaking ? (
                  <button type="button" className="cyber-button-primary" onClick={() => handlePlayAIAnswer(buildSimpleExplanation())}>
                    <Play size={16} /> Play explanation
                  </button>
                ) : (
                  <>
                    <button type="button" className="cyber-button-secondary" onClick={handleToggleSpeech}>
                      {aiPaused ? <Play size={15} /> : <Pause size={15} />}{aiPaused ? 'Resume' : 'Pause'}
                    </button>
                    <button type="button" className="cyber-button-secondary" onClick={handleStopAI}>
                      <Square size={14} /> Stop
                    </button>
                  </>
                )}
              </div>
            </section>

            {/* Key Findings */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.72rem', fontWeight: '700', color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>Key Findings</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { label: 'Main Claim', value: result.main_claim || headline || 'Not identified' },
                  { label: 'Verification Status', value: vStatus },
                  { label: 'Content Risk Score', value: result.risk_score !== undefined ? `${result.risk_score}/100` : 'Not provided' },
                  { label: 'Evidence Checked', value: 'No external sources checked' },
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#0D1424', padding: '0.6rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', minWidth: '100px' }}>{f.label}</span>
                    <span style={{ fontSize: '0.825rem', color: '#D1D5DB' }}>{f.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Sources */}
            <div style={{ marginBottom: '0.5rem' }}>
              <h4 style={{ fontSize: '0.72rem', fontWeight: '700', color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>Verification Sources</h4>
              <div style={{ backgroundColor: '#0D1424', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize: '0.85rem', color: '#9CA3AF', lineHeight: '1.65', margin: 0 }}>
                  No reliable external evidence was available to independently verify this claim. Always cross-check with trusted news outlets and primary sources.
                </p>
              </div>
            </div>

            <ReportActions result={result} moduleType="news" onDownloadPDF={handlePDF} onAnalyzeAnother={handleReset} />
          </div>

          {/* AI Chat Card */}
          <div className="cyber-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#818CF8', marginBottom: '1.25rem' }}>
              Article Questions
            </h3>

            {/* Suggested Questions */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {SUGGESTED_QS.map((q, i) => (
                <button key={i} onClick={() => handleAskAI(q)} disabled={chatLoading} style={{
                  padding: '0.35rem 0.75rem', fontSize: '0.72rem', fontWeight: '500', borderRadius: '9999px',
                  backgroundColor: 'rgba(99,102,241,0.08)', color: '#A5B4FC', border: '1px solid rgba(99,102,241,0.2)',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease',
                }}>
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Messages */}
            {chatMsgs.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                {chatMsgs.map((m, i) => (
                  <div key={i} style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    backgroundColor: m.role === 'user' ? 'rgba(99,102,241,0.12)' : '#0D1424',
                    border: `1px solid ${m.role === 'user' ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)'}`,
                    padding: '0.75rem 1rem', borderRadius: '10px',
                  }}>
                    <p style={{ fontSize: '0.65rem', fontWeight: '700', color: m.role === 'user' ? '#A5B4FC' : '#818CF8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      {m.role === 'user' ? 'You' : 'System Note'}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#D1D5DB', lineHeight: '1.65', margin: 0 }}>{m.text}</p>
                    {m.role === 'ai' && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                        {!aiSpeaking ? (
                          <button onClick={() => handlePlayAIAnswer(m.text)} style={{
                            padding: '0.25rem 0.65rem', fontSize: '0.68rem', fontWeight: '600', borderRadius: '6px',
                            backgroundColor: 'rgba(16,185,129,0.1)', color: '#34D399', border: '1px solid rgba(16,185,129,0.25)',
                            cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.3rem',
                          }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                            Play
                          </button>
                        ) : (
                          <button onClick={handleStopAI} style={{
                            padding: '0.25rem 0.65rem', fontSize: '0.68rem', fontWeight: '600', borderRadius: '6px',
                            backgroundColor: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.25)',
                            cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.3rem',
                          }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>
                            Stop
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#0D1424', borderRadius: '8px' }}>
                    <RefreshCw size={14} color="#6366F1" className="animate-spin" />
                    <span style={{ fontSize: '0.8rem', color: '#A5B4FC' }}>Thinking...</span>
                  </div>
                )}
              </div>
            )}

            {/* Chat Input */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask something about this article..."
                className="cyber-input" style={{ flex: 1, minWidth: '200px' }}
                onKeyDown={e => { if (e.key === 'Enter') handleAskAI(chatInput); }}
              />
              <button onClick={() => handleAskAI(chatInput)} className="cyber-button-primary" disabled={chatLoading || !chatInput.trim()} style={{ padding: '0.6rem 1rem' }}>
                Submit Question
              </button>
              {!chatVoiceListening ? (
                <button onClick={handleChatVoiceStart} className="cyber-button-secondary" style={{ padding: '0.6rem 0.85rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                </button>
              ) : (
                <button onClick={handleChatVoiceStop} style={{
                  padding: '0.6rem 0.85rem', borderRadius: '8px', cursor: 'pointer',
                  backgroundColor: 'rgba(239,68,68,0.15)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)',
                  fontFamily: 'inherit', display: 'flex', alignItems: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
