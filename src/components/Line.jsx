import { convertDay } from "../utils/functions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import moment from "moment";
import {
  updateOrderLine,
  addOrderLine,
  removeOrderLine,
  orderBreakLine,
} from "../services/services/OrderActions";
import {
  getMealCode,
  getMealLabel,
  getMealPrice,
  convertToUnix,
  enableDay,
} from "../utils/functions";
import { regimeColors } from "../app/configuration";
const dayToMs = 24 * 3600 * 1000;
const Line = ({
  id,
  date,
  week,
  month,
  place,
  meals,
  disabledMeals,
  regimeId,
}) => {
  const dispatch = useDispatch();
  const order = useSelector((state) => state.orderReducer.order, shallowEqual);
  const regimes = useSelector(
    (state) => state.regimesReducer.regimes,
    shallowEqual
  );
  let token = localStorage.getItem("token") || "";
  const day = date.getDay() || 7;
  const mm = date.getMonth();
  const year = mm < month ? date.getFullYear() : date.getFullYear() + 1;
  const firstDay = mm === month ? date : new Date(year, month, 1); // //Jour J du mois actuel, et premier jour du mois suivant
  const lastDay = new Date(year, month + 1, 0); // Dernier jour du mois
  const init_week = Math.ceil(date.getDate() / 7);

  // shiftMin et shiftMax sont les nombres min et max de jours
  // à partir de la date actuelle pour lesquelles la saisie est possible (non grisée)
  let shiftMax =
    mm === month ? lastDay.getDate() - date.getDate() : lastDay.getDate();
  let shiftMin = 0;
  if (mm === month) {
    shiftMin = -1;
  }
  const handleCheckBox = (shift, id, date) => {
    // console.log(date.toDateString());
    const selectedDate = date; // initialisation à la date du jour
    selectedDate.setHours(0, 0, 0, 0);
    if (mm === month) {
      selectedDate.setDate(selectedDate.getDate() + shift); // date du jour + shift = selected date
    } else {
      selectedDate.setDate(selectedDate.getDate() + shift - 1); // date du jour + shift = selected date
    }
    let selectedLines = [];
    let count = 0;
    console.log(
      "SHIFT: ",
      shift,
      "selectedDate: ",
      selectedDate.toDateString()
    );
    selectedLines = order.lines.filter(
      (line) =>
        getMealCode(line.libelle) === id || getMealCode(line.label) === id
    );

    // ----- Mise à jour des lignes de commande ----- //
    selectedLines.map((line) => {
      const dateDebut = new Date( // Récupère date de début de ligne avant modification
        moment.unix(line.array_options.options_lin_datedebut)
      );
      const dateFin = new Date( // Récupère date de fin de ligne avant modification
        moment.unix(line.array_options.options_lin_datefin)
      );
      let newLine = { ...line, array_options: { ...line.array_options } };
      let {
        options_lin_datedebut,
        options_lin_datefin,
        options_lin_room,
        options_lin_intakeplace,
      } = newLine.array_options;
      let qty = Number(line.qty);

      // ----- SUPPRESSION de ligne de commande ---- //
      if (
        convertToUnix(selectedDate) === options_lin_datedebut &&
        options_lin_datedebut === options_lin_datefin &&
        options_lin_intakeplace === String(place.rowid)
      ) {
        dispatch(removeOrderLine(order.id, line.id, order.socid, month, token));
      } else if (
        // ----- Mise à jour de ligne de commande ---- //
        // Si l'utilisateur retire le premier repas de la ligne de commande
        selectedDate.getTime() === dateDebut.getTime() &&
        options_lin_intakeplace === String(place.rowid)
      ) {
        qty -= 1;
        new Date(dateDebut.setDate(dateDebut.getDate() + 1));
        options_lin_datedebut = convertToUnix(dateDebut);
        newLine.array_options.options_lin_datedebut = options_lin_datedebut;

        newLine.qty = String(qty);
        dispatch(
          updateOrderLine(
            line.commande_id,
            line.id,
            newLine,
            order.socid,
            month,
            token
          )
        );
      } else if (
        // Si l'utilisateur retire le dernier repas de la ligne de commande
        selectedDate.getTime() === dateFin.getTime() &&
        options_lin_intakeplace === String(place.rowid)
      ) {
        qty -= 1;
        new Date(dateFin.setDate(dateFin.getDate() - 1));
        options_lin_datefin = convertToUnix(dateFin);
        newLine.array_options.options_lin_datefin = options_lin_datefin;

        newLine.qty = String(qty);
        dispatch(
          updateOrderLine(
            line.commande_id,
            line.id,
            newLine,
            order.socid,
            month,
            token
          )
        );
      } else if (
        // Si l'utilisateur ajoute un repas la veille de la date de début avec le même régime
        selectedDate.getTime() === dateDebut.getTime() - dayToMs &&
        options_lin_room === regimeId &&
        options_lin_intakeplace === String(place.rowid)
      ) {
        options_lin_datedebut = convertToUnix(selectedDate);
        qty += 1;
        newLine.array_options.options_lin_datedebut = options_lin_datedebut;
        newLine.qty = String(qty);
        dispatch(
          updateOrderLine(
            line.commande_id,
            line.id,
            newLine,
            order.socid,
            month,
            token
          )
        );
      } else if (
        // Si l'utilisateur ajoute un repas le lendemain de la date de fin avec le même régime
        selectedDate.getTime() === dateFin.getTime() + dayToMs &&
        options_lin_room === regimeId &&
        options_lin_intakeplace === String(place.rowid)
      ) {
        let followingLine = selectedLines.filter(
          (line) =>
            line.array_options.options_lin_datedebut ===
            convertToUnix(selectedDate) + 24 * 3600
        );
        // S'il existe une commande le jour d'après avec le même régime, on fusionne les deux
        followingLine = followingLine[0];
        if (
          followingLine &&
          followingLine.array_options.options_lin_room === regimeId &&
          options_lin_intakeplace === String(place.rowid)
        ) {
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
          dispatch(
            updateOrderLine(
              line.commande_id,
              line.id,
              newLine,
              order.socid,
              month,
              token
            )
          );
          // Delete the next command line:
          dispatch(
            removeOrderLine(
              order.id,
              followingLine.id,
              order.socid,
              month,
              token
            )
          );
        } else {
          qty += 1;
          options_lin_datefin = convertToUnix(selectedDate);
          newLine.array_options.options_lin_datefin = options_lin_datefin;
          newLine.qty = String(qty);

          dispatch(
            updateOrderLine(
              line.commande_id,
              line.id,
              newLine,
              order.socid,
              month,
              token
            )
          );
        }
      } else if (
        // Si l'utilisateur retire un repas au milieu d'une ligne de commande
        convertToUnix(selectedDate) > options_lin_datedebut &&
        convertToUnix(selectedDate) < options_lin_datefin &&
        options_lin_intakeplace === String(place.rowid)
      ) {
        dispatch(
          orderBreakLine(order, line, convertToUnix(selectedDate), month, token)
        );
      } else {
        count++;
      }
    });

    // ----- Création de ligne de commande ------ //
    if (count === selectedLines.length || selectedLines.length === 0) {
      dispatch(
        addOrderLine(
          order,
          month,
          {
            array_options: {
              options_lin_room: regimeId,
              options_lin_intakeplace: String(place.rowid),
              options_lin_datedebut: convertToUnix(selectedDate),
              options_lin_datefin: convertToUnix(selectedDate),
            },
            fk_product: String(id + 1),
            label: getMealLabel(id),
            qty: "1",
            subprice: getMealPrice(id),
            remise_percent: 0,
          },
          token
        )
      );
    }
  };

  let line = [];
  switch (id) {
    case "dayNum":
      line.push(
        <div>
          <h2>{place.label}</h2>
        </div>
      );
      break;
    case 1:
      line.push(<div>Petit-Déjeuner</div>);
      break;
    case 2:
      line.push(<div>Déjeuner</div>);
      break;
    case 3:
      line.push(<div>Diner</div>);
      break;
    default:
      line.push(<div></div>);
  }
  for (let i = 1; i < 8; i++) {
    let shift = 0;
    if (mm === month) {
      shift = i - day + (week - init_week) * 7;
    } else {
      shift = i - (firstDay.getDay() || 7) + 1 + (week - 1) * 7;
    }
    if (id === "dayName") {
      line.push(
        <div
          key={i}
          style={{
            color: enableDay(shift, shiftMin, shiftMax) ? "black" : "lightgrey",
          }}
        >
          {convertDay(i)}
        </div>
      );
    } else if (id === "dayNum") {
      let dateShift = "";
      if (mm === month) {
        dateShift = new Date();
        dateShift.setDate(dateShift.getDate() + shift);
      } else {
        dateShift = new Date(year, month, 0);
        dateShift.setDate(dateShift.getDate() + shift);
      }
      line.push(
        <div
          className="num"
          key={i}
          style={{
            color: enableDay(shift, shiftMin, shiftMax) ? "black" : "lightgrey",
          }}
        >
          {dateShift.getDate()}
        </div>
      );
    } else if (id === "buttons") {
      line.push(
        <div key={i}>
          {enableDay(shift, shiftMin, shiftMax) &&
            (meals.filter((item) => item.includes(`M${month}_w${week}_d${i}`))
              .length === 3 ? (
              <FontAwesomeIcon
                icon="fa-regular fa-circle-xmark"
                size="2xl"
                style={{ color: "#ab0032" }}
                // onClick={() => {
                //   handleDayButtons(shift);
                // }}
              />
            ) : (
              <FontAwesomeIcon
                icon="fa-solid fa-chevron-up"
                // onClick={() => {
                //   handleDayButtons(shift);
                // }}
              />
            ))}
        </div>
      );
    } else {
      let accentColor = regimeColors[0].color;
      const meal = meals.filter(
        (meal) =>
          meal.startsWith(`m${id}_M${month}_w${week}_d${i}`) &&
          meal.endsWith(`p${place.rowid}`)
      );
      // console.log(meals);
      // console.log(`m${id}_M${month}_w${week}_d${i}_p${place.rowid}`);
      // console.log("meal: ", meal);
      if (meal.length === 1) {
        const regimeID = String(meal[0][meal[0].indexOf("r") + 1]);
        const regime = regimes.filter((regime) => regime.rowid === regimeID);
        if (regime.length > 0) {
          const color = regimeColors.filter(
            (regimeColor) => regimeColor.code === regime[0].code
          );

          accentColor = color[0].color;
        }
      }

      const disabledMeal = disabledMeals.includes(
        `m${id}_M${month}_w${week}_d${i}_p${place.rowid}`
      );
      if (enableDay(shift, shiftMin, shiftMax) && !disabledMeal) {
        line.push(
          <div key={i}>
            <input
              type="checkbox"
              style={{
                accentColor: accentColor,
              }}
              onChange={() => {
                handleCheckBox(shift, id, firstDay, place);
              }}
              checked={meal.length === 1}
            />
          </div>
        );
      } else {
        line.push(
          <div key={i}>
            <input type="checkbox" disabled />
          </div>
        );
      }
    }
  }
  return <div>{line}</div>;
};

export default Line;
