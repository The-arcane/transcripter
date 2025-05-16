import requests
import json
from pathlib import Path

def train_model():
    # Load training data
    training_data = Path('training_data.txt').read_text(encoding='utf-8')

    
    # Configure system prompt
    system_prompt = """You are HealthBot 🏥, a medical AI assistant trained by Raunaq Adlakha.
    Focus on providing clear, accurate health guidance with proper formatting and medical context."""
    
    # Send training data to Llama
    response = requests.post("http://localhost:11434/api/generate", json={
        "model": "llama2",
        "prompt": f"{system_prompt}\n\nHere is some training data to learn from:\n\n{training_data}",
        "stream": False
    })
    
    if response.status_code == 200:
        print("✅ HealthBot training completed successfully")
    else:
        print("❌ Training failed:", response.text)

if __name__ == "__main__":
    print("🏥 Starting HealthBot training...")
    train_model()