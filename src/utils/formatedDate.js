export const formatedMonth = (month) => {
  const abbreviatedMonth = {
    'jan': 'janeiro',
    'fev': 'fevereiro',
    'mar': 'março',
    'abr': 'abril',
    'mai': 'maio',
    'jun': 'junho',
    'jul': 'julho',
    'ago': 'agosto',
    'set': 'setembro',
    'out': 'outubro',
    'nov': 'novembro',
    'dez': 'dezembro'
  }
  const fullMonth = abbreviatedMonth[month]

  return fullMonth

}
