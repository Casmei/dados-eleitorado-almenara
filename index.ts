import csvToJson from "convert-csv-to-json";
import fs from "fs";
import iconv from "iconv-lite";

let fileInputName = "consulta_cand_2024_MG.csv";
let fileOutputName = "myOutputFile.json";

// Ler o conteúdo do arquivo CSV usando a codificação ISO-8859-1
let fileContent = fs.readFileSync(fileInputName, { encoding: "binary" });
let convertedContent = iconv.decode(
  Buffer.from(fileContent, "binary"),
  "ISO-8859-1"
);

// Salva o conteúdo convertido em um arquivo temporário para processamento
let tempFileName = "temp_converted.csv";
fs.writeFileSync(tempFileName, convertedContent);

// Converte o CSV para JSON e remove as barras invertidas
let jsonArray = csvToJson.formatValueByType(true).getJsonFromCsv(tempFileName);

// Manipula a estrutura para remover as aspas adicionais e substituir "#NULO#" por null
jsonArray = jsonArray.map((item) => {
  let newItem: any = {};
  Object.keys(item).forEach((key) => {
    const newKey = key.replace(/^"|"$/g, ""); // Remove aspas duplas das chaves
    let newValue =
      typeof item[key] === "string"
        ? item[key].replace(/^"|"$/g, "")
        : item[key];

    // Substitui "#NULO#" por null
    if (newValue === "#NULO#") {
      newValue = null;
    }

    newItem[newKey] = newValue;
  });
  return newItem;
});

// Salva o JSON no arquivo de saída
fs.writeFileSync(fileOutputName, JSON.stringify(jsonArray, null, 2));

// Remove o arquivo temporário após a conversão
fs.unlinkSync(tempFileName);

console.log("CSV convertido para JSON com sucesso!");
