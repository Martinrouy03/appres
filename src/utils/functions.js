import moment from "moment";

export const filterMeals = (meals, id, week, relWeek, firstDay, place) => {
  return meals.filter((item) =>
    week === 0 || relWeek === 0
      ? item[item.indexOf("d") + 1] >= firstDay &&
        item.startsWith(`m${id}_w${week}`) &&
        item.endsWith(`${place}`)
      : item.startsWith(`m${id}_w${week}`) && item.endsWith(`${place}`)
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

// const getUserToken = async () => {
//   const userData = await axios.get(
//     "http://localhost/dolibarr/api/index.php/login?login=Martin&password=KarmapaChenn0&reset=1"
//   );
//   setToken(userData.data.token);
// };

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
  return (
    (shiftMin === -1 && shift >= 0 && shift <= shiftMax) ||
    (shift > shiftMin && shift <= shiftMax)
  );
};

export const computeMaxWeeks = (year, month, previousMonth) => {
  let maxWeeks = 0;
  if (previousMonth) {
    const lastDayfromPreviousMonth = new Date(year, month, 0); // dernier jour du mois précédent
    maxWeeks = Math.ceil(lastDayfromPreviousMonth.getDate() / 7);
    const weekDay = lastDayfromPreviousMonth.getDay() || 7;
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
  }
  return maxWeeks;
};
export const convertLinesToArray = (orderLines) => {
  const date = new Date();
  let week = 0;
  const weekday = date.getDay() || 7;
  const meals = [];
  const disabledMeals = [];
  const places = ["1", "2", "3"];
  orderLines.map((line) => {
    if (line.product_ref !== "STA24_9990") {
      const regime = line.array_options.options_lin_room;
      const place = line.array_options.options_lin_intakeplace;
      const disabledPlaces = places.filter((p) => p !== place);
      const dateDebut = new Date(
        moment.unix(line.array_options.options_lin_datedebut)
      );
      const dateFin = new Date(
        moment.unix(line.array_options.options_lin_datefin)
      );

      const total = (dateFin - dateDebut) / (24 * 3600 * 1000) + 1;
      let mealCode = getMealCode(line.label);
      for (let i = 0; i < total; i++) {
        const atomicDate = new Date(
          moment.unix(line.array_options.options_lin_datedebut)
        );
        atomicDate.setDate(atomicDate.getDate() + i);
        const shift =
          (atomicDate.getTime() - date.getTime()) / (24 * 3600 * 1000);
        week = Math.floor((weekday + shift) / 7);
        const weekday_tmp = atomicDate.getDay() || 7;
        meals.push(
          `m${mealCode}_w${week}_d${weekday_tmp}_r${regime}_p${place}`
        );
        disabledPlaces.map((p) => {
          disabledMeals.push(`m${mealCode}_w${week}_d${weekday_tmp}_p${p}`);
        });
      }
    }
  });
  return { meals: meals, disabledMeals: disabledMeals };
};

export const convertToUnix = (date) => {
  return Math.floor(date.getTime() / 1000);
};

export const handleCheckBox = (shift, id, date) => {
  const selectedDate = date;
  selectedDate.setHours(0, 0, 0, 0);
  selectedDate.setDate(selectedDate.getDate() + shift);
  let selectedLines = [];
  let count = 0;
  selectedLines = order.lines.filter((line) => getMealCode(line.label) === id);

  // ----- Mise à jour des lignes de commande ----- //
  selectedLines.map((line) => {
    const dateDebut = new Date( // Récupère date de début de ligne avant modification
      moment.unix(line.array_options.options_lin_datedebut)
    );
    const dateFin = new Date( // Récupère date de fin de ligne avant modification
      moment.unix(line.array_options.options_lin_datefin)
    );
    const { label, subprice, remise_percent, fk_product } = line;
    let qty = Number(line.qty);

    let {
      options_lin_datedebut,
      options_lin_datefin,
      options_lin_room,
      options_lin_intakeplace,
    } = line.array_options;

    let newLine = {
      array_options: {
        options_lin_room: options_lin_room,
        options_lin_intakeplace: options_lin_intakeplace,
        options_lin_datedebut: options_lin_datedebut,
        options_lin_datefin: options_lin_datefin,
      },
      fk_product: fk_product,
      label: label,
      qty: line.qty,
      subprice: subprice,
      remise_percent: remise_percent,
    };

    // ----- SUPPRESSION de ligne de commande ---- //
    if (
      convertToUnix(selectedDate) === options_lin_datedebut &&
      options_lin_datedebut === options_lin_datefin
    ) {
      dispatch(removeOrderLine(order.id, line.id));
    } else if (
      // ----- Mise à jour de ligne de commande ---- //
      // Si l'utilisateur retire le premier repas de la ligne de commande
      selectedDate.getTime() === dateDebut.getTime()
    ) {
      qty -= 1;
      new Date(dateDebut.setDate(dateDebut.getDate() + 1));
      options_lin_datedebut = convertToUnix(dateDebut);
      newLine.array_options.options_lin_datedebut = options_lin_datedebut;
      newLine.qty = String(qty);
      dispatch(updateOrderLine(line.commande_id, line.id, newLine));
    } else if (
      // Si l'utilisateur retire le dernier repas de la ligne de commande
      selectedDate.getTime() === dateFin.getTime()
    ) {
      qty -= 1;
      new Date(dateFin.setDate(dateFin.getDate() - 1));
      options_lin_datefin = convertToUnix(dateFin);
      newLine.array_options.options_lin_datefin = options_lin_datefin;
      newLine.qty = String(qty);
      dispatch(updateOrderLine(line.commande_id, line.id, newLine));
    } else if (
      // Si l'utilisateur ajoute un repas la veille de la date de début
      selectedDate.getTime() ===
      dateDebut.getTime() - dayToMs
    ) {
      options_lin_datedebut = convertToUnix(selectedDate);
      qty += 1;
      newLine.array_options.options_lin_datedebut = options_lin_datedebut;
      newLine.qty = String(qty);
      dispatch(updateOrderLine(line.commande_id, line.id, newLine));
    } else if (
      // Si l'utilisateur ajoute un repas le lendemain de la date de fin
      selectedDate.getTime() ===
      dateFin.getTime() + dayToMs
    ) {
      let followingLine = selectedLines.filter(
        (line) =>
          line.array_options.options_lin_datedebut ===
          convertToUnix(selectedDate) + 24 * 3600
      );
      followingLine = followingLine[0];
      if (followingLine) {
        const newLine = { ...line, array_options: { ...line.array_options } };
        newLine.array_options.options_lin_datefin =
          followingLine.array_options.options_lin_datefin;
        const additionalDays =
          (followingLine.array_options.options_lin_datefin -
            convertToUnix(selectedDate)) /
            (24 * 3600) +
          1;
        newLine.qty = String(Number(newLine.qty) + additionalDays);
        // Extend the previous command line:
        dispatch(updateOrderLine(line.commande_id, line.id, newLine));
        // Delete the next command line:
        dispatch(removeOrderLine(order.id, followingLine.id));
      } else {
        qty += 1;
        options_lin_datefin = convertToUnix(selectedDate);
        newLine.array_options.options_lin_datefin = options_lin_datefin;
        newLine.qty = String(qty);
        dispatch(updateOrderLine(line.commande_id, line.id, newLine));
      }
    } else if (
      // Si l'utilisateur retire un repas au milieu d'une ligne de commande
      convertToUnix(selectedDate) > options_lin_datedebut &&
      convertToUnix(selectedDate) < options_lin_datefin
    ) {
      dispatch(orderBreakLine(order, line, convertToUnix(selectedDate)));
    } else {
      count++;
    }
  });

  // ----- Création de ligne de commande ------ //
  if (count === selectedLines.length || selectedLines.length === 0) {
    dispatch(
      addOrderLine(order, {
        array_options: {
          options_lin_room: "4",
          options_lin_intakeplace: "dummy",
          options_lin_datedebut: convertToUnix(selectedDate),
          options_lin_datefin: convertToUnix(selectedDate),
        },
        fk_product: String(id + 1),
        label: getMealLabel(id),
        qty: "1",
        subprice: getMealPrice(id),
        remise_percent: 0,
      })
    );
  }
};

// -----------------------------------------------//
