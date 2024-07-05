import { convertDay } from "../utils/functions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import moment from "moment";
// import * as _ from "lodash";
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
const Line = ({ id, date, week, month, place, meals, regimeId }) => {
  const dispatch = useDispatch();
  const disabledMeals =
    useSelector((state) => state.orderReducer.disabledMeals) || [];
  const order = useSelector((state) => state.orderReducer.order, shallowEqual);
  const token = useSelector(
    (state) => state.loginReducer.user.token,
    shallowEqual
  );
  const day = date.getDay() || 7;
  const mm = date.getMonth();
  const year = date.getFullYear();
  // shiftMin et shiftMax sont les nombres min et max de jours à partir de la date actuelle pour lesquelles la saisie est possible (non grisée)
  let shiftMax = 0;
  for (let i = mm; i <= month; i++) {
    const tmp = new Date(year, i + 1, 0);
    if (i === mm) {
      shiftMax = tmp.getDate() - date.getDate();
    } else {
      shiftMax += tmp.getDate();
    }
  }

  let shiftMin = 0;
  for (let i = mm; i <= month; i++) {
    const tmp = new Date(year, i, 0);
    if (i === mm) {
      shiftMin = -1;
    } else if (i === mm + 1) {
      shiftMin += tmp.getDate() - date.getDate() + 1;
    } else {
      shiftMin += tmp.getDate();
    }
  }
  const handleCheckBox = (shift, id, date) => {
    const selectedDate = date;
    selectedDate.setHours(0, 0, 0, 0);
    selectedDate.setDate(selectedDate.getDate() + shift);
    let selectedLines = [];
    let count = 0;
    selectedLines = order.lines.filter(
      (line) => getMealCode(line.label) === id
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
        dispatch(removeOrderLine(order.id, line.id, order.socid, month));
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
            removeOrderLine(order.id, followingLine.id, order.socid, month)
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
          orderBreakLine(order, line, convertToUnix(selectedDate), month)
        );
      } else {
        count++;
      }
    });

    // ----- Création de ligne de commande ------ //
    if (count === selectedLines.length || selectedLines.length === 0) {
      dispatch(
        addOrderLine(order, month, {
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
        })
      );
    }
    // return "OK";
  };

  // -----------------------------------------------//

  // const handleDayButtons = async (shift) => {
  //   const selectedDate = date;
  //   selectedDate.setHours(0, 0, 0, 0);
  //   selectedDate.setDate(selectedDate.getDate() + shift);
  //   let selectedLines = [];
  //   selectedLines = order.lines.filter(
  //     (line) =>
  //       line.array_options.options_lin_datedebut <=
  //         convertToUnix(selectedDate) &&
  //       line.array_options.options_lin_datefin >= convertToUnix(selectedDate)
  //   );
  //   let count = 0;

  //   if (selectedLines.length === 3) {
  //     // Si tous les repas du jour sont déjà sélectionnés, on les supprime et on met à jour les lignes concernées
  //     selectedLines.map((line) => {
  //       const dateDebut = new Date( // Récupère date de début de ligne avant modification
  //         moment.unix(line.array_options.options_lin_datedebut)
  //       );
  //       const dateFin = new Date( // Récupère date de fin de ligne avant modification
  //         moment.unix(line.array_options.options_lin_datefin)
  //       );
  //       let newLine = { ...line, array_options: { ...line.array_options } };
  //       let { options_lin_datedebut, options_lin_datefin } =
  //         newLine.array_options;
  //       let qty = Number(line.qty);
  //       if (
  //         // ----- SUPPRESSION de ligne de commande ---- //
  //         convertToUnix(selectedDate) === options_lin_datedebut &&
  //         options_lin_datedebut === options_lin_datefin
  //       ) {
  //         dispatch(removeOrderLine(order.id, line.id));
  //       } else if (
  //         // ----- Mise à jour de ligne de commande ---- //
  //         // Si l'utilisateur retire le premier repas de la ligne de commande
  //         selectedDate.getTime() === dateDebut.getTime()
  //       ) {
  //         qty -= 1;
  //         new Date(dateDebut.setDate(dateDebut.getDate() + 1));
  //         options_lin_datedebut = convertToUnix(dateDebut);
  //         newLine.array_options.options_lin_datedebut = options_lin_datedebut;
  //         newLine.qty = String(qty);
  //         dispatch(updateOrderLine(line.commande_id, line.id, newLine));
  //       } else if (
  //         // Si l'utilisateur retire le dernier repas de la ligne de commande
  //         selectedDate.getTime() === dateFin.getTime()
  //       ) {
  //         qty -= 1;
  //         new Date(dateFin.setDate(dateFin.getDate() - 1));
  //         options_lin_datefin = convertToUnix(dateFin);
  //         newLine.array_options.options_lin_datefin = options_lin_datefin;
  //         newLine.qty = String(qty);
  //         dispatch(updateOrderLine(line.commande_id, line.id, newLine));
  //       } else if (
  //         // Pour retirer un repas au milieu d'une ligne de commande
  //         convertToUnix(selectedDate) > options_lin_datedebut &&
  //         convertToUnix(selectedDate) < options_lin_datefin
  //       ) {
  //         dispatch(orderBreakLine(order, line, convertToUnix(selectedDate)));
  //       } else {
  //         count++;
  //       }
  //     });
  //   } else {
  //     // si selectedLines.length < 3 (= s'il reste des repas non sélectionnés)
  //     for (let id = 1; id <= 3; id++) {
  //       const existingLine = selectedLines.filter(
  //         (line) => getMealCode(line.label) === id
  //       );
  //       if (existingLine.length === 0) {
  //         // s'il n'y a pas de repas enregistré pour ce jour et cet id
  //         let adjacentLines = []; // On commence par vérifier s'il existe des lignes adjacentes (i.e. dont les dates sont contigües avec le jour sélectionné)
  //         adjacentLines = order.lines.filter(
  //           (line) =>
  //             getMealCode(line.label) === id &&
  //             (line.array_options.options_lin_datedebut ===
  //               convertToUnix(selectedDate) + 24 * 3600 ||
  //               line.array_options.options_lin_datefin ===
  //                 convertToUnix(selectedDate) - 24 * 3600)
  //         );
  //         if (adjacentLines.length > 0) {
  //           // S'il y a des lignes adjacentes:
  //           adjacentLines.map(async (line) => {
  //             const dateDebut = new Date( // Récupère date de début de ligne avant modification
  //               moment.unix(line.array_options.options_lin_datedebut)
  //             );
  //             const dateFin = new Date( // Récupère date de fin de ligne avant modification
  //               moment.unix(line.array_options.options_lin_datefin)
  //             );
  //             let newLine = {
  //               ...line,
  //               array_options: { ...line.array_options },
  //             };
  //             let { options_lin_datedebut, options_lin_datefin } =
  //               newLine.array_options;
  //             let qty = Number(line.qty);
  //             if (
  //               // Si l'utilisateur ajoute un repas la veille de la date de début
  //               selectedDate.getTime() ===
  //               dateDebut.getTime() - dayToMs
  //             ) {
  //               options_lin_datedebut = convertToUnix(selectedDate);
  //               qty += 1;
  //               newLine.array_options.options_lin_datedebut =
  //                 options_lin_datedebut;
  //               newLine.qty = String(qty);
  //               dispatch(updateOrderLine(line.commande_id, line.id, newLine));
  //             } else if (
  //               // Si l'utilisateur ajoute un repas le lendemain de la date de fin
  //               selectedDate.getTime() ===
  //               dateFin.getTime() + dayToMs
  //             ) {
  //               let followingLine = adjacentLines.filter(
  //                 (line) =>
  //                   line.array_options.options_lin_datedebut ===
  //                   convertToUnix(selectedDate) + 24 * 3600
  //               );
  //               followingLine = followingLine[0];
  //               if (followingLine) {
  //                 // Dans le cas où la box vide est prise en sandwich entre deux lignes adjacentes:
  //                 const newLine = {
  //                   ...line,
  //                   array_options: { ...line.array_options },
  //                 };
  //                 newLine.array_options.options_lin_datefin =
  //                   followingLine.array_options.options_lin_datefin;
  //                 const additionalDays =
  //                   (followingLine.array_options.options_lin_datefin -
  //                     convertToUnix(selectedDate)) /
  //                     (24 * 3600) +
  //                   1;
  //                 newLine.qty = String(Number(newLine.qty) + additionalDays);
  //                 // Extend the previous command line:
  //                 await dispatch(
  //                   updateOrderLine(line.commande_id, line.id, newLine)
  //                 );
  //                 // Delete the next command line:
  //                 dispatch(removeOrderLine(order.id, followingLine.id));
  //               } else {
  //                 qty += 1;
  //                 options_lin_datefin = convertToUnix(selectedDate);
  //                 newLine.array_options.options_lin_datefin =
  //                   options_lin_datefin;
  //                 newLine.qty = String(qty);
  //                 dispatch(updateOrderLine(line.commande_id, line.id, newLine));
  //               }
  //             }
  //           });
  //         } else {
  //           // Sinon, s'il n'y a pas de ligne adjacente, on créé une nouvelle commande
  //           await dispatch(
  //             addOrderLine(order, {
  //               array_options: {
  //                 options_lin_room: "4",
  //                 options_lin_intakeplace: String(place.rowid),
  //                 options_lin_datedebut: convertToUnix(selectedDate),
  //                 options_lin_datefin: convertToUnix(selectedDate),
  //               },
  //               fk_product: String(id + 1),
  //               label: getMealLabel(id),
  //               qty: "1",
  //               subprice: getMealPrice(id),
  //               remise_percent: 0,
  //             })
  //           );
  //         }
  //       }
  //     }
  //   }
  // };

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
    const shift = i - day + week * 7;

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
      const dateShift = new Date();
      // console.log(shiftMin, shift, shiftMax);
      dateShift.setDate(dateShift.getDate() + shift);
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
            (meals.filter((item) => item.includes(`w${week}_d${i}`)).length ===
            3 ? (
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
      // let meal = "";
      // if (meals) {
      const meal = meals.filter(
        (meal) =>
          meal.startsWith(`m${id}_w${week}_d${i}`) &&
          meal.endsWith(`p${place.rowid}`)
      );
      if (meal.length === 1) {
        const color = regimeColors.filter(
          (regimeColor) =>
            regimeColor.rowid === String(meal[0][meal[0].indexOf("r") + 1])
        );
        accentColor = color[0].color;
      }
      // }

      const disabledMeal = disabledMeals.includes(
        `m${id}_w${week}_d${i}_p${place.rowid}`
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
                handleCheckBox(shift, id, date, place);
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
