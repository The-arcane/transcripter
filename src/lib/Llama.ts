let waitingForPrescriptionConfirmation = false;

export async function talkToLlama(prompt: string): Promise<string> {
  const transcriptionCheck = /please\s+give\s+transcription\s+of\s+call\s+just\s+now/i;
  const prescriptionCheck = /please\s+give\s+the\s+prescription/i;
  const confirmationCheck = /\b(yes|yeah|sure|confirm)\b/i;

  const buttonStyle = "padding:12px 24px; border:none; background:linear-gradient(to right,#4CAF50,#45A049); color:white; border-radius:8px; cursor:pointer; font-size:16px; box-shadow:0 4px 6px rgba(0,0,0,0.1); transition: transform 0.2s;";
  const hoverEffect = "this.style.transform='scale(1.05)';";
  const normalEffect = "this.style.transform='scale(1)';";

  if (transcriptionCheck.test(prompt)) {
    return `Here is your document: 
    <button onclick="window.open('/transcription.pdf', '_blank')" 
    style="${buttonStyle}" 
    onmouseover="${hoverEffect}" onmouseout="${normalEffect}">
    Download Transcription 📄</button>`;
  }

  if (prescriptionCheck.test(prompt)) {
    waitingForPrescriptionConfirmation = true;
    return `Here is your document: 
    <button onclick="window.open('/prescription.pdf', '_blank')" 
    style="${buttonStyle.replace('#4CAF50','#2196F3').replace('#45A049','#1E88E5')}" 
    onmouseover="${hoverEffect}" onmouseout="${normalEffect}">
    Download Prescription 📄</button><br><br>Is the prescription okay? Should I send it to the patient?`;
  }

  if (waitingForPrescriptionConfirmation && confirmationCheck.test(prompt)) {
    waitingForPrescriptionConfirmation = false;
    return "✅ Okay, prescription sent to patient.";
  }

  return 'I am trained to only fetch and give the documents: <strong>prescription</strong> and <strong>transcription</strong>.';
}

export function convertEmojis(text: string): string {
  const emojiMap = {
    ':hospital:': '🏥',
    ':thermometer:': '🌡️',
    ':pill:': '💊',
    ':warning:': '⚠️',
    ':doctor:': '👨‍⚕️',
    ':bulb:': '💡',
    ':drop_of_blood:': '🩸',
    ':microscope:': '🔬',
    ':anatomical_heart:': '🫀',
    ':lungs:': '🫁',
    ':brain:': '🧠',
    ':bandage:': '🩹',
    ':dna:': '🧬',
    ':syringe:': '💉',
    ':mask:': '😷',
    ':nauseated_face:': '🤢',
    ':sneezing_face:': '🤧',
    ':hot_face:': '🥵',
    ':cold_face:': '🥶',
    ':dizzy_face:': '😵',
    ':face_with_thermometer:': '🤒',
    ':face_with_head_bandage:': '🤕',
  };

  return Object.entries(emojiMap).reduce(
    (text, [code, emoji]) => text.replace(new RegExp(code, 'gi'), emoji),
    text
  );
}
