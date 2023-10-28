
export const formatedDate = (date) => {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]
  const data = new Date(date);
  const day = data.getDate();
  const month = months[data.getMonth()];
  const year = data.getFullYear();

  return `${day} de ${month} de ${year}`
}