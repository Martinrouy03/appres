import moment from "moment";
import { store } from "../app/App";

export const filterMeals = (
  meals,
  id,
  week,
  init_week,
  firstDay,
  place,
  mm,
  month
) => {
  return meals.filter((item) =>
    (mm === month && week === init_week) || week === 1
      ? item[item.indexOf("d") + 1] >= firstDay &&
        item.startsWith(`m${id}_M${month}_w${week}`) &&
        item.endsWith(`${place}`)
      : item.startsWith(`m${id}_M${month}_w${week}`) &&
        item.endsWith(`${place}`)
  );
};
export function computeLengthMax(
  mm,
  month,
  week,
  init_week,
  maxWeeks,
  firstWeekDay,
  lastWeekDay
) {
  let lengthMax = 7; // used for weekButtons display
  if ((mm === month && week === init_week) || week === 1) {
    lengthMax = 7 - firstWeekDay + 1;
  } else if (week === maxWeeks) {
    lengthMax = lastWeekDay || 7;
  }
  return lengthMax;
}
export function computeShift(mm, month, i, day, firstDay, week, init_week) {
  let shift = 0;
  if (mm === month) {
    shift = i - day + (week - init_week) * 7;
  } else {
    shift = i - (firstDay || 7) + 1 + (week - 1) * 7;
  }
  return shift;
}
export function computeDateShift(mm, month, year, shift) {
  let dateShift = "";
  if (mm === month) {
    dateShift = new Date();
    dateShift.setDate(dateShift.getDate() + shift);
  } else {
    dateShift = new Date(year, month, 0);
    dateShift.setDate(dateShift.getDate() + shift);
  }
  return dateShift;
}
export const enableDay = (
  shift,
  shiftMin,
  shiftMax,
  month,
  mm,
  id,
  hh,
  deadline
) => {
  if (month === mm && shift === 0) {
    if (id === 1) {
      return hh < deadline.breakfast;
    } else if (id === 2) {
      return hh < deadline.lunch;
    } else {
      return hh < deadline.dinner;
    }
  } else {
    return (
      (shiftMin === -1 && shift >= 0 && shift <= shiftMax) ||
      (shift > shiftMin && shift <= shiftMax)
    );
  }
};
export const computeMaxWeeks = (year, month, previousMonth) => {
  let maxWeeks = 0;
  if (previousMonth) {
    const lastDayfromPreviousMonth = new Date(year, month, 0); // dernier jour du mois précédent
    const weekDay = lastDayfromPreviousMonth.getDay() || 7;
    maxWeeks = Math.ceil((lastDayfromPreviousMonth.getDate() + weekDay) / 7);
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
    // maxWeeks--;
  }
  return maxWeeks;
};
export const convertLinesToArray = (orderLines, codeRepas) => {
  let week = 1;
  const date = new Date(); // date du jour
  const mm = date.getMonth(); // Mois actuel
  const meals = [];
  const disabledMeals = [];
  const places = store.getState().placesReducer.places;
  const config = store.getState().configurationReducer.configuration;
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

      // let mealCode = getMealCode(line.libelle) || getMealCode(line.label);
      let mealCode = config.meal.filter(
        (meal) => meal.label === line.libelle || meal.label === line.label
      );

      mealCode = mealCode[0].code;

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
