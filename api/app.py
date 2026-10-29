import json
import os

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from flasgger import Swagger

from service import BddfPayloadError, process_bddf_request

load_dotenv()

app = Flask(__name__)

DEV = os.getenv("DEV", "false").lower() == "true"

if DEV:
    origins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
    ]
else:
    origins = os.getenv("FRONTEND_URL")

    if not origins:
        raise ValueError("FRONTEND_URL não configurada no ambiente de produção")

    origins = [origins]

CORS(app, origins=origins)

swagger = Swagger(app)

@app.route("/")
def home():
    return jsonify({
        "mensagem": "API funcionando!",
        "routes":["/upload"]
    })

@app.route("/upload", methods = ["POST"])
def upload():
    """
    Envia um arquivo BDDF ou um payload JSON para a API.
    ---
    tags:
      - Upload
    consumes:
      - multipart/form-data
      - application/json
    parameters:
      - name: file
        in: formData
        type: file
        required: false
        description: Arquivo JSON/TXT exportado pelo BDDF
    responses:
      200:
        description: Programas e itens processados com sucesso
      400:
        description: Requisição inválida ou arquivo com JSON inválido
    """
    try:
        payload = _get_upload_payload()
        result = process_bddf_request(payload)
    except (BddfPayloadError, json.JSONDecodeError, UnicodeDecodeError) as error:
        return jsonify({"erro": str(error)}), 400

    return jsonify(result), 200


def _get_upload_payload():
    file = request.files.get("file")
    if file is not None:
        if not file.filename:
            raise BddfPayloadError("Arquivo não enviado")
        return json.loads(file.read().decode("utf-8"))

    if request.is_json:
        payload = request.get_json(silent=False)
        if payload is None:
            raise BddfPayloadError("Corpo JSON vazio")
        return payload

    raise BddfPayloadError("Envie um arquivo no campo 'file' ou um corpo JSON")


if __name__ == "__main__":
    app.run(debug=True, port=3000)