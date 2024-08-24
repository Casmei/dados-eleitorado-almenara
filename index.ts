import csvToJson from "convert-csv-to-json";
import fs from "fs";
import iconv from "iconv-lite";
import AdmZip from "adm-zip";

let fileInputName = "consulta_cand_2024_MG.zip";
let fileOutputName = "myOutputFile.json";

// Extrair o arquivo CSV do ZIP
const zip = new AdmZip(fileInputName);
const zipEntries = zip.getEntries();
let csvFileName = null;

// Localizar o arquivo CSV no ZIP
zipEntries.forEach((entry) => {
  if (entry.entryName.endsWith(".csv")) {
    csvFileName = entry.entryName;
    zip.extractEntryTo(entry, "./", false, true);
  }
});

// Verificar se encontramos o arquivo CSV
if (!csvFileName) {
  console.error("Nenhum arquivo CSV encontrado no ZIP.");
  process.exit(1);
}

// Ler o conteúdo do arquivo CSV extraído usando a codificação ISO-8859-1
let fileContent = fs.readFileSync(csvFileName, { encoding: "binary" });
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

// Filtra os dados para incluir apenas informações sobre Almenara
let filteredArray = jsonArray.filter((item) => item["NM_UE"] === "ALMENARA");

// Salva o JSON filtrado no arquivo de saída
fs.writeFileSync(fileOutputName, JSON.stringify(filteredArray, null, 2));

// Remove os arquivos temporários após a conversão
fs.unlinkSync(tempFileName);
fs.unlinkSync(csvFileName);

console.log("CSV convertido para JSON com sucesso e filtrado por Almenara!");
