# atualizar_dados.py
# Script para atualizar os dados locais da Lotofácil
# Uso: python atualizar_dados.py (requer: pip install pandas requests)

import requests
import pandas as pd
import json
from datetime import datetime

# --- CONFIGURAÇÕES ---
API_URL = "https://api.guidi.dev.br/loteria/lotofacil/concursos"
CSV_PATH = "./public/data/lotofacil_completo.csv"
JSON_PATH = "./public/data/analise_completa.json"


def calcular_analise_completa(df):
    total_concursos = len(df)

    # Frequência
    freq_map = {str(i): 0 for i in range(1, 26)}
    for dezenas in df['dezenas']:
        for d in dezenas:
            freq_map[str(d)] = freq_map.get(str(d), 0) + 1

    # Paridade
    pares_arr = df['dezenas'].apply(lambda dezenas: sum(1 for d in dezenas if d % 2 == 0))

    # Soma
    somas = df['dezenas'].apply(sum)

    # Repetição
    reps = []
    dezenas_list = df['dezenas'].tolist()
    for i in range(1, len(dezenas_list)):
        reps.append(len(set(dezenas_list[i]) & set(dezenas_list[i - 1])))

    # Atrasos
    atrasos = {str(num): 0 for num in range(1, 26)}
    for num in range(1, 26):
        for i in range(len(dezenas_list) - 1, -1, -1):
            if num in dezenas_list[i]:
                break
            atrasos[str(num)] += 1

    return {
        "total_concursos": total_concursos,
        "frequencia_numeros": {k: int(v) for k, v in freq_map.items()},
        "frequencia_esperada": round((total_concursos * 15) / 25, 2),
        "paridade": {
            "media_pares": round(float(pares_arr.mean()), 2),
            "desvio_padrao": round(float(pares_arr.std()), 2),
            "distribuicao": {str(k): int(v) for k, v in pares_arr.value_counts().items()},
        },
        "soma": {
            "minima": int(somas.min()),
            "maxima": int(somas.max()),
            "media": round(float(somas.mean()), 2),
            "mediana": int(somas.median()),
            "desvio_padrao": round(float(somas.std()), 2),
            "intervalo_1sigma": [
                round(float(somas.mean() - somas.std()), 2),
                round(float(somas.mean() + somas.std()), 2),
            ],
        },
        "repeticao_anterior": {
            "media": round(float(pd.Series(reps).mean()), 2),
            "desvio_padrao": round(float(pd.Series(reps).std()), 2),
            "distribuicao": {str(k): int(v) for k, v in pd.Series(reps).value_counts().items()},
        },
        "atrasos_atuais": atrasos,
        "probabilidades": {
            "11": round(0.0877, 6),
            "12": round(0.0167, 6),
            "13": round(0.00145, 6),
            "14": round(4.59e-05, 6),
            "15": round(3.06e-07, 10),
        },
    }


def main():
    print("Buscando dados existentes...")
    try:
        df_local = pd.read_csv(CSV_PATH)
        ultimo_concurso_local = int(df_local['concurso'].max())
        print(f"Último concurso local: #{ultimo_concurso_local}")
    except FileNotFoundError:
        print("Arquivo local não encontrado. Criando um novo.")
        df_local = pd.DataFrame()
        ultimo_concurso_local = 0

    print(f"Buscando novos concursos da API (a partir de #{ultimo_concurso_local + 1})...")
    try:
        response = requests.get(API_URL, timeout=15)
        response.raise_for_status()
        todos_dados = response.json()
    except requests.RequestException as e:
        print(f"Erro ao buscar dados da API: {e}")
        return

    novos_dados = [item for item in todos_dados if (item.get('concurso') or item.get('numero', 0)) > ultimo_concurso_local]

    if not novos_dados:
        print("Nenhum concurso novo encontrado. Os dados já estão atualizados.")
        return

    print(f"{len(novos_dados)} novos concursos encontrados.")

    novos_rows = []
    for item in novos_dados:
        dezenas = sorted([int(d) for d in item.get('dezenas', []) or item.get('listaDezenas', [])])
        if len(dezenas) != 15:
            continue

        premiacoes = item.get('premiacoes', [])
        g15 = premiacoes[0].get('ganhadores', 0) if len(premiacoes) > 0 else 0
        v15 = premiacoes[0].get('valorPremio', 0) if len(premiacoes) > 0 else 0
        g14 = premiacoes[1].get('ganhadores', 0) if len(premiacoes) > 1 else 0
        v14 = premiacoes[1].get('valorPremio', 0) if len(premiacoes) > 1 else 0
        g13 = premiacoes[2].get('ganhadores', 0) if len(premiacoes) > 2 else 0
        v13 = premiacoes[2].get('valorPremio', 0) if len(premiacoes) > 2 else 0
        g12 = premiacoes[3].get('ganhadores', 0) if len(premiacoes) > 3 else 0
        v12 = premiacoes[3].get('valorPremio', 0) if len(premiacoes) > 3 else 0
        g11 = premiacoes[4].get('ganhadores', 0) if len(premiacoes) > 4 else 0
        v11 = premiacoes[4].get('valorPremio', 0) if len(premiacoes) > 4 else 0

        data_str = item.get('data', '')
        try:
            data_str = datetime.strptime(data_str[:10], '%Y-%m-%d').strftime('%d/%m/%Y')
        except (ValueError, TypeError):
            pass

        novos_rows.append({
            'concurso': item.get('concurso') or item.get('numero'),
            'data': data_str,
            'dezenas': '"' + ','.join(f"{d:02d}" for d in dezenas) + '"',
            'acumulado': item.get('acumulado', False),
            'valor_arrecadado': 0,
            'ganhadores_15': g15, 'valor_premio_15': v15,
            'ganhadores_14': g14, 'valor_premio_14': v14,
            'ganhadores_13': g13, 'valor_premio_13': v13,
            'ganhadores_12': g12, 'valor_premio_12': v12,
            'ganhadores_11': g11, 'valor_premio_11': v11,
        })

    df_novos = pd.DataFrame(novos_rows)
    df_final = pd.concat([df_local, df_novos], ignore_index=True).drop_duplicates(subset=['concurso']).sort_values('concurso').reset_index(drop=True)

    print(f"Total de concursos agora: {len(df_final)}. Salvando CSV...")
    df_final.to_csv(CSV_PATH, index=False)

    print("Recalculando análise completa...")
    # Preparar dezenas para análise
    def parse_dezenas(val):
        s = str(val).strip('"')
        return [int(d) for d in s.split(',')]

    df_final['dezenas'] = df_final['dezenas'].apply(parse_dezenas)
    analise_final = calcular_analise_completa(df_final)

    print("Salvando JSON com nova análise...")
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(analise_final, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Dados atualizados com sucesso! Total: {len(df_final)} concursos.")
    print(f"Execute: git add public/data/* && git commit -m 'Atualiza dados até concurso #{int(df_final['concurso'].max())}'")


if __name__ == "__main__":
    main()
