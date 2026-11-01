const priceFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' });
const dateFormatter = new Intl.DateTimeFormat('es-AR', { dateStyle: 'long', timeStyle: 'short' });

export const formatPrice = (price) => priceFormatter.format(price);
export const formatDate = (isoDate) => dateFormatter.format(new Date(isoDate));
