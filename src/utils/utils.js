// import moment from "moment";

// // const getUserToken = async () => {
// //   const userData = await axios.get(
// //     "http://localhost/dolibarr/api/index.php/login?login=Martin&password=KarmapaChenn0&reset=1"
// //   );
// //   setToken(userData.data.token);
// // };

// export const getMealCode = (code) => {
//   switch (code) {
//     case "Petit-déjeuner":
//       return 1;
//     case "Déjeuner":
//       return 2;
//     case "Dîner":
//       return 3;
//     default:
//       return 0;
//   }
// };

// export const convertLinesToArray = (orderLines) => {
//   const date = new Date();
//   let week = 0;
//   const weekday = date.getDay() || 7;
//   const meals = [];
//   orderLines.map((line) => {
//     const dateDebut = new Date(
//       moment.unix(line.array_options.options_lin_datedebut)
//     );
//     const dateFin = new Date(
//       moment.unix(line.array_options.options_lin_datefin)
//     );
//     const total = (dateFin - dateDebut) / (24 * 3600 * 1000) + 1;
//     // console.log("total: ", total);
//     let mealCode = getMealCode(line.label);
//     for (let i = 0; i < total; i++) {
//       const atomicDate = new Date(
//         moment.unix(line.array_options.options_lin_datedebut)
//       );
//       // console.log("dateDebut: ", dateDebut);
//       atomicDate.setDate(atomicDate.getDate() + i);
//       // console.log(atomicDate);
//       const shift =
//         (atomicDate.getTime() - date.getTime()) / (24 * 3600 * 1000);
//       if (shift > 0) {
//         // console.log("shift: ", shift);
//         week = Math.floor((weekday + shift) / 7);
//         const weekday_tmp = atomicDate.getDay() || 7;
//         meals.push(`${mealCode}_${week}_${weekday_tmp}`);
//       }
//     }
//   });
//   return meals;
// };

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

// {month - mm < commandNb - 1 && (
//     <FontAwesomeIcon
//       onClick={() => {
//         let nDays = 0;
//         let tmp = new Date();
//         let weeks = 0;
//         // On calcule le nombre de semaine entre la date du jour et le dernier jour du mois considéré
//         for (let m = mm; m <= month; m++) {
//           tmp = new Date(year, m + 1, 0); // On calcule le nombre de jours du mois considéré
//           let w = 0;
//           if (m === mm) {
//             // pour le mois actuel
//             nDays = tmp.getDate() - date.getDate(); // On calcule le nombre de jours restants avant la fin du mois
//             w = Math.floor(nDays / 7);
//             const weekDay = new Date(year, m, 7 * w).getDay();
//             while (
//               new Date(year, m, 7 * w - weekDay).getDate() >
//               new Date(
//                 year,
//                 m,
//                 7 * (w - 1) - weekDay + 1
//               ).getDate()
//             ) {
//               w++;
//             }
//             w--;
//           } else {
//             // pour les autres mois
//             w = Math.floor(tmp.getDate() / 7);
//             const weekDay = new Date(year, m, 7 * w).getDay();
//             while (
//               new Date(year, m, 7 * w - weekDay).getDate() >
//               new Date(
//                 year,
//                 m,
//                 7 * (w - 1) - weekDay + 1
//               ).getDate()
//             ) {
//               w++;
//             }
//             w--;
//           }
//           weeks = weeks + w;
//         }
//         setRelWeek(1);
//         setWeek(weeks);
//         setMonth(month + 1);
//       }}
//       icon="fa-solid fa-chevron-right"
//       size="xl"
//       style={{ color: "#ab0032" }}
//     />
//   )}
