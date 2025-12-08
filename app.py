import torch
from transformers import BertTokenizerFast, BertModel
import joblib
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def homepage():
    return FileResponse("static/index.html")

print("➡️ Carregando tokenizer...")
tokenizer = BertTokenizerFast.from_pretrained("./tokenizer")

print("➡️ Carregando modelo BERT...")
bert_model = BertModel.from_pretrained("./model")
bert_model.eval()

print("➡️ Carregando classificador...")
classifier = joblib.load("logistic_regression_classifier.joblib")

class InputData(BaseModel):
    title: str
    text: str

@app.post("/predict")
def predict(data: InputData):
    full_text = data.title + " " + data.text

    tokens = tokenizer(
        full_text,
        padding=True,
        truncation=True,
        max_length=256,
        return_tensors="pt"
    )

    with torch.no_grad():
        outputs = bert_model(**tokens)
        cls_embedding = outputs.last_hidden_state[:, 0, :]  # CLS token

    pred = classifier.predict(cls_embedding.numpy())[0]
    proba = classifier.predict_proba(cls_embedding.numpy())[0]
    
    print(pred, proba)

    return {
        # pred == 0 é FAKE. O isFake do front-end é TRUE se a string for "True".
        "prediction": "fake" if pred == 1 else "true", 
        "probabilities": proba.tolist()
    }
