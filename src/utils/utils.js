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
