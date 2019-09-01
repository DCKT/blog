import format from 'date-fns/format'
import fr from 'date-fns/locale/fr'

export const formatDate = (language, date) => {
  return format(new Date(date), 'dd MMMM yyyy', {
    locale: language === 'fr' ? fr : null,
  })
}
