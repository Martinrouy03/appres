import moment from "moment";
import { store } from "../app/App";
import config from "../app/configuration.json";

export const filterMeals = (meals, id, week, firstDay, place, month) => {
  return meals.filter((item) =>
    week === 1
      ? item[item.indexOf("d") + 1] >= firstDay &&
        item.startsWith(`m${id}_M${month}_w${week}`) &&
        item.endsWith(`${place}`)
      : item.startsWith(`m${id}_M${month}_w${week}`) &&
        item.endsWith(`${place}`)
  );
};
export function convertMonth(mm) {
  let month = "";
  switch (mm) {
    case 0:
      month = "Janvier";
      break;
    case 1:
      month = "Février";
      break;
    case 2:
      month = "Mars";
      break;
    case 3:
      month = "Avril";
      break;
    case 4:
      month = "Mai";
      break;
    case 5:
      month = "Juin";
      break;
    case 6:
      month = "Juillet";
      break;
    case 7:
      month = "Août";
      break;
    case 8:
      month = "Septembre";
      break;
    case 9:
      month = "Octobre";
      break;
    case 10:
      month = "Novembre";
      break;
    case 11:
      month = "Décembre";
      break;
    default:
      month = mm;
  }
  return month;
}
export function convertDay(d) {
  let weekday = "";
  switch (d) {
    case 1:
      weekday = "Lundi";
      break;
    case 2:
      weekday = "Mardi";
      break;
    case 3:
      weekday = "Mercredi";
      break;
    case 4:
      weekday = "Jeudi";
      break;
    case 5:
      weekday = "Vendredi";
      break;
    case 6:
      weekday = "Samedi";
      break;
    case 7:
      weekday = "Dimanche";
      break;
    default:
      weekday = "??";
  }
  return weekday;
}
export const getMealCode = (label) => {
  switch (label) {
    case "Petit-déjeuner":
      return 1;
    case "Déjeuner":
      return 2;
    case "Dîner":
      return 3;
    default:
      return 0;
  }
};
export const getRegimeCode = (boolean) => {
  switch (boolean) {
    case false:
      return "4";
    case true:
      return "2";
    default:
      return "0";
  }
};
export const getMealLabel = (code) => {
  switch (code) {
    case 1:
      return "Petit-déjeuner";
    case 2:
      return "Déjeuner";
    case 3:
      return "Dîner";
    default:
      return 0;
  }
};
export const getPlaceLabel = (code) => {
  switch (code) {
    case 1:
      return "Le Bost";
    case 2:
      return "Laussedat";
    case 3:
      return "Ermitage";
    default:
      return 0;
  }
};
export const getMealPrice = (code) => {
  switch (code) {
    case 1:
      return "2";
    case 2:
      return "3.5";
    case 3:
      return "3";
    default:
      return 0;
  }
};
export const enableDay = (shift, shiftMin, shiftMax) => {
  // console.log("shift: ", shift, "shiftMin: ", shiftMin, "shiftMax: ", shiftMax);
  return (
    (shiftMin === -1 && shift >= 0 && shift <= shiftMax) ||
    (shift > shiftMin && shift <= shiftMax)
  );
};
export const computeMaxWeeks = (year, month, previousMonth) => {
  let maxWeeks = 0;
  if (previousMonth) {
    const lastDayfromPreviousMonth = new Date(year, month, 0); // dernier jour du mois précédent
    const weekDay = lastDayfromPreviousMonth.getDay() || 7;
    maxWeeks = Math.ceil((lastDayfromPreviousMonth.getDate() + weekDay) / 7);
    console.log("maxweek_init: ", maxWeeks);
    while (
      new Date(
        year,
        month - 1,
        lastDayfromPreviousMonth.getDate() - 7 * maxWeeks - weekDay + 1
      ).getDate() <
      new Date(
        year,
        month - 1,
        lastDayfromPreviousMonth.getDate() - 7 * maxWeeks + 7 - weekDay
      ).getDate()
    ) {
      if (
        new Date(
          year,
          month - 1,
          lastDayfromPreviousMonth.getDate() - 7 * maxWeeks - weekDay + 1
        ).getDate() === 1
      ) {
        break;
      }
      maxWeeks--;
      console.log("maxweek function: ", maxWeeks);

      console.log(
        new Date(
          year,
          month - 1,
          lastDayfromPreviousMonth.getDate() - 7 * maxWeeks - weekDay + 1
        ).toDateString(),
        new Date(
          year,
          month - 1,
          lastDayfromPreviousMonth.getDate() - 7 * maxWeeks + 7 - weekDay
        ).toDateString()
      );
    }
    maxWeeks++;
  } else {
    const lastDayfromSelectedMonth = new Date(year, month + 1, 0); // dernier jour du mois sélectionné
    maxWeeks = Math.floor(lastDayfromSelectedMonth.getDate() / 7); // Nombre max de changements de semaine / mois
    const weekDay = new Date(year, month, 7 * maxWeeks).getDay();
    while (
      new Date(year, month, 7 * maxWeeks - weekDay).getDate() >
      new Date(year, month, 7 * (maxWeeks - 1) - weekDay + 1).getDate()
    ) {
      maxWeeks++;
    }
    maxWeeks--;
  }
  return maxWeeks;
};
export const convertLinesToArray = (orderLines) => {
  const codeRepas = config.codeRepas;
  let week = 1;
  const date = new Date(); // date du jour
  const mm = date.getMonth(); // Mois actuel
  const meals = [];
  const disabledMeals = [];
  const places = store.getState().placesReducer.places;
  let placeids = [];
  places && places.map((place) => placeids.push(place.rowid));
  orderLines.map((line) => {
    // mapping sur les lignes de commandes
    if (line.product_ref !== codeRepas) {
      const regime = line.array_options.options_lin_room;
      const place = line.array_options.options_lin_intakeplace;
      const disabledPlaces = placeids.filter((p) => p !== place);
      const dateDebut = new Date(
        moment.unix(line.array_options.options_lin_datedebut)
      );
      const month = dateDebut.getMonth();
      const year = dateDebut.getFullYear();
      const firstDay = new Date(year, month, 1);
      const monthDay = mm === month ? date.getDate() : firstDay.getDay() || 7;
      const dateFin = new Date(
        moment.unix(line.array_options.options_lin_datefin)
      );

      const total = (dateFin - dateDebut) / (24 * 3600 * 1000) + 1; // nb de jours dans la commande
      let mealCode = getMealCode(line.libelle) || getMealCode(line.label);

      for (let i = 0; i < total; i++) {
        const atomicDate = new Date(
          moment.unix(line.array_options.options_lin_datedebut)
        );

        // boucle sur chaque jour de la commande
        atomicDate.setDate(atomicDate.getDate() + i);
        const shift =
          mm === month
            ? (atomicDate.getTime() - date.getTime()) / (24 * 3600 * 1000)
            : (atomicDate.getTime() - firstDay.getTime()) / (24 * 3600 * 1000); // nombre de jours entre aujourd'hui et le jour en question
        week = Math.ceil((monthDay + shift) / 7);
        const weekday_tmp = atomicDate.getDay() || 7;
        meals.push(
          `m${mealCode}_M${month}_w${week}_d${weekday_tmp}_r${regime}_p${place}`
        );
        disabledPlaces.map((p) => {
          disabledMeals.push(
            `m${mealCode}_M${month}_w${week}_d${weekday_tmp}_p${p}`
          );
        });
      }
    }
  });
  return { meals: meals, disabledMeals: disabledMeals };
};
export const convertToUnix = (date) => {
  return Math.floor(date.getTime() / 1000);
};

// -----------------------------------------------//
