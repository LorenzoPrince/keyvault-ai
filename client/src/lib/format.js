const priceFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' });
const dateFormatter = new Intl.DateTimeFormat('es-AR', { dateStyle: 'long', timeStyle: 'short' });
const shortDateFormatter = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export const formatPrice = (price) => priceFormatter.format(price);
export const formatDate = (isoDate) => dateFormatter.format(new Date(isoDate));
export const formatShortDate = (isoDate) => shortDateFormatter.format(new Date(isoDate));
