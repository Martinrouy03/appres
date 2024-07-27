import { useState } from "react";
import moment from "moment";
// Icons
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faChevronRight,
  faChevronLeft,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  getMealCode,
  getMealLabel,
  getMealPrice,
  convertToUnix,
  computeShift,
  computeMaxWeeks,
  computeLengthMax,
  convertMonth,
  filterMeals,
  convertLinesToArray,
  computeDateShift,
} from "../utils/functions";
//Theming
import "./App.scss";
import "../fonts.css";
// *** Redux
import { useDispatch } from "react-redux";
import { shallowEqual, useSelector } from "react-redux";
import { useEffect } from "react";
// Actions
import {
  getOrder,
  addOrderLine,
  updateOrderLine,
  removeOrderLine,
  orderBreakLine,
  updateOrderLineandAddOrderline,
} from "../services/services/OrderActions";
import { getPlaces } from "../services/services/PlacesActions";
import { getRegimes } from "../services/services/RegimesActions";
import { getConfiguration } from "../services/services/ConfigurationActions";
// Composants
import { CircularProgress } from "@mui/material";
import RadioButtons from "../components/RadioButtons";
import Header from "../components/Header";
import Line from "../components/Line";
import LoginModal from "../components/LoginModal";

// *** Rsdux Initialisation, store building
import { configureStore } from "@reduxjs/toolkit";
import ConfigurationReducer from "../services/services/ConfigurationReducer";
import OrderReducer from "../services/services/OrderReducer";
import PlacesReducer from "../services/services/PlacesReducer";
import RegimesReducer from "../services/services/RegimesReducer";
import LoginReducer from "../services/login/LoginReducer";

library.add(faChevronRight, faChevronLeft, faChevronUp, faCircleXmark);

export const store = configureStore({
  reducer: {
    configurationReducer: ConfigurationReducer,
    orderReducer: OrderReducer,
    placesReducer: PlacesReducer,
    regimesReducer: RegimesReducer,
    loginReducer: LoginReducer,
  },
});

function App() {
  const dispatch = useDispatch();
  // fetch login variables in localStorage:
  let token = localStorage.getItem("token") || "";
  const userId = localStorage.getItem("userId") || "";

  // initializing date variables:
  const date = new Date();
  const day = date.getDay() || 7;
  const year = date.getFullYear();
  const mm = date.getMonth();
  const monthDay = date.getDate();
  const init_week = Math.ceil(monthDay / 7);

  // State instantiations:
  // const [configLoaded, setConfigLoaded] = useState(false);
  const [regimeId, setRegimeId] = useState("4");
  const [commandNb, setCommandNb] = useState(0);
  const [week, setWeek] = useState(init_week);
  const [month, setMonth] = useState(mm);
  const [lang, setLang] = useState("FR");

  // More date variables
  const newDate = new Date(year, month, 1);
  const firstWeekDay = mm === month ? day : newDate.getDay() || 7; // Jour de la semaine du premier jour du mois
  const lastWeekDay = new Date(year, month + 1, 0).getDay(); // Jour de la semaine du dernier jour du mois
  const maxWeeks = computeMaxWeeks(year, month, 0);
  const lengthMax = computeLengthMax(
    mm,
    month,
    week,
    init_week,
    maxWeeks,
    firstWeekDay,
    lastWeekDay
  );

  // Selector instantiations:
  const config = useSelector(
    (state) => state.configurationReducer.configuration,
    shallowEqual
  );
  const order = useSelector((state) => state.orderReducer.order, shallowEqual);
  const places = useSelector(
    (state) => state.placesReducer.places,
    shallowEqual
  );
  const regimes = useSelector(
    (state) => state.regimesReducer.regimes,
    shallowEqual
  );
  const loading = useSelector(
    (state) => state.orderReducer.loading,
    shallowEqual
  );
  const user = useSelector(
    (state) => state.loginReducer.user.username,
    shallowEqual
  );
  const modalClose = useSelector(
    (state) => state.loginReducer.modalClose,
    shallowEqual
  );

  // fetch meals and disabledMeals arrays, used to display the checkboxs
  let result = {
    meals: [],
    disabledMeals: [],
  };
  result = order.lines ? convertLinesToArray(order.lines) : result;
  const meals = result.meals;
  const disabledMeals = result.disabledMeals;

  // Identifying the type of meals: 1 = Breakfast; 2 = Lunch; 3 = Dinner:
  const ids = [1, 2, 3];
  const maxid = ids[ids.length - 1]; // maxid is used to identify the last Line component of each Place table, in order to apply specific css (border-radius)

  useEffect(() => {
    dispatch(getConfiguration());
    token && dispatch(getPlaces(token));
    token && dispatch(getRegimes(token));
    token &&
      config.codeRepas &&
      dispatch(getOrder(userId, month, setCommandNb, token));
  }, [month, user, modalClose, config]);
  const handleWeekButtons = (id, month, week, place, suppress) => {
    const shift = computeShift(
      mm,
      month,
      1, // i
      day,
      firstWeekDay,
      week,
      init_week
    );

    // Determine startDate and endDate:
    let anteStartDate = computeDateShift(mm, month, year, shift - 1);
    anteStartDate.setHours(0, 0, 0, 0);
    let startDate = computeDateShift(mm, month, year, shift);
    startDate.setHours(0, 0, 0, 0);
    let endDate = computeDateShift(mm, month, year, shift + 6);
    endDate.setHours(0, 0, 0, 0);
    let postEndDate = computeDateShift(mm, month, year, shift + 7);
    postEndDate.setHours(0, 0, 0, 0);
    if ((mm === month && week === init_week) || week === 1) {
      startDate.setDate(startDate.getDate() + 7 - lengthMax);
    }
    if (week === maxWeeks) {
      endDate.setDate(endDate.getDate() - 7 + lengthMax);
    }

    // Identify orderlines already existing within the selected week and id
    let selectedLines = [];
    selectedLines = order.lines.filter(
      (line) =>
        (getMealCode(line.libelle) === id || getMealCode(line.label) === id) &&
        line.array_options.options_lin_datedebut >= convertToUnix(startDate) &&
        line.array_options.options_lin_datefin <= convertToUnix(endDate)
    );
    // Identify orderline already crossing the startDate,
    // or just the day before the desired week
    let anteLine = [];
    anteLine = order.lines.filter(
      (line) =>
        (getMealCode(line.libelle) === id || getMealCode(line.label) === id) &&
        // line.array_options.options_lin_room === regimeId &&
        line.array_options.options_lin_datedebut <=
          convertToUnix(anteStartDate) &&
        line.array_options.options_lin_datefin >=
          convertToUnix(anteStartDate) &&
        line.array_options.options_lin_datefin <= convertToUnix(endDate)
    );

    // Identify orderline already crossing the endDate,
    // or just the day after the desired week
    let postLine = [];
    postLine = order.lines.filter(
      (line) =>
        (getMealCode(line.libelle) === id || getMealCode(line.label) === id) &&
        // line.array_options.options_lin_room === regimeId &&
        line.array_options.options_lin_datedebut >= convertToUnix(startDate) &&
        line.array_options.options_lin_datedebut <=
          convertToUnix(postEndDate) &&
        line.array_options.options_lin_datefin >= convertToUnix(postEndDate)
    );

    // Identify orderline already crossing both startDate and endDate
    let bridgeLine = [];
    bridgeLine = order.lines.filter(
      (line) =>
        (getMealCode(line.libelle) === id || getMealCode(line.label) === id) &&
        line.array_options.options_lin_datedebut < convertToUnix(startDate) &&
        line.array_options.options_lin_datefin > convertToUnix(endDate)
    );
    if (suppress) {
      if (bridgeLine.length === 1) {
        console.log("SPLIT BRIGDE LINE");
        bridgeLine = {
          ...bridgeLine[0],
          array_options: { ...bridgeLine[0].array_options },
        };
        dispatch(
          orderBreakLine(
            order,
            bridgeLine,
            convertToUnix(startDate),
            1,
            month,
            token
          )
        );
      } else if (
        anteLine.length === 1 &&
        postLine.length === 1 &&
        postLine[0].array_options.options_lin_datedebut ===
          convertToUnix(startDate)
      ) {
        console.log("SHORTEN POSTLINE");
        postLine = {
          ...postLine[0],
          array_options: { ...postLine[0].array_options },
        };
        postLine.array_options.options_lin_datedebut =
          convertToUnix(postEndDate);
        postLine.qty = Number(postLine.qty) - lengthMax;
        dispatch(
          updateOrderLine(
            postLine.commande_id,
            postLine.id,
            postLine,
            order.socid,
            month,
            token
          )
        );
      } else if (anteLine.length === 1) {
        // ANTELINE
        anteLine = {
          ...anteLine[0],
          array_options: { ...anteLine[0].array_options },
        };
        if (
          anteLine.array_options.options_lin_datefin === convertToUnix(endDate)
        ) {
          console.log("SHORTEN ANTELINE");
          anteLine.array_options.options_lin_datefin =
            convertToUnix(anteStartDate);
          anteLine.qty = Number(anteLine.qty) - lengthMax;
          dispatch(
            updateOrderLine(
              anteLine.commande_id,
              anteLine.id,
              anteLine,
              order.socid,
              month,
              token
            )
          );
        } else {
          console.log("isANTELINE: DELETE WEEKLINE");
          dispatch(
            removeOrderLine(
              order.id,
              selectedLines[0].id,
              order.socid,
              month,
              token
            )
          );
        }
      } else if (postLine.length === 1) {
        // POSTLINE
        postLine = {
          ...postLine[0],
          array_options: { ...postLine[0].array_options },
        };
        if (
          postLine.array_options.options_lin_datedebut ===
          convertToUnix(startDate)
        ) {
          console.log("SHORTEN POSTLINE");
          postLine.array_options.options_lin_datedebut =
            convertToUnix(postEndDate);
          postLine.qty = Number(postLine.qty) - lengthMax;
          dispatch(
            updateOrderLine(
              postLine.commande_id,
              postLine.id,
              postLine,
              order.socid,
              month,
              token
            )
          );
        } else {
          console.log("DELETE WEEKLINE POSTLINE");
          dispatch(
            removeOrderLine(
              order.id,
              selectedLines[0].id,
              order.socid,
              month,
              token
            )
          );
        }
      } else {
        // Sinon, on supprime la weekLine
        dispatch(
          removeOrderLine(
            order.id,
            selectedLines[0].id,
            order.socid,
            month,
            token
          )
        );
      }
    } else {
      if (anteLine.length === 1 && postLine.length === 1) {
        //ANTELINE && POSTLINE
        console.log("ANTELINE & POSTLINE");
        anteLine = {
          ...anteLine[0],
          array_options: { ...anteLine[0].array_options },
        };
        postLine = {
          ...postLine[0],
          array_options: { ...postLine[0].array_options },
        };
        const overflowingAnteDays =
          (anteLine.array_options.options_lin_datefin -
            convertToUnix(anteStartDate)) /
          (24 * 3600);
        const overflowingPostDays =
          (convertToUnix(postEndDate) -
            postLine.array_options.options_lin_datedebut) /
          (24 * 3600);
        if (
          anteLine.array_options.options_lin_room === regimeId &&
          postLine.array_options.options_lin_room === regimeId
        ) {
          const addDays =
            (postLine.array_options.options_lin_datefin -
              convertToUnix(endDate)) /
            (24 * 3600);
          anteLine.array_options.options_lin_datefin =
            postLine.array_options.options_lin_datefin;
          anteLine.qty =
            Number(anteLine.qty) + 7 - overflowingAnteDays + addDays;
          dispatch(
            removeOrderLine(order.id, postLine.id, order.socid, month, token)
          );
          dispatch(
            updateOrderLine(
              anteLine.commande_id,
              anteLine.id,
              anteLine,
              order.socid,
              month,
              token
            )
          );
        } else if (
          anteLine.array_options.options_lin_room === regimeId &&
          postLine.array_options.options_lin_room !== regimeId
        ) {
          anteLine.array_options.options_lin_datefin = convertToUnix(endDate);
          anteLine.qty = Number(anteLine.qty) + lengthMax - overflowingAnteDays;

          dispatch(
            updateOrderLine(
              anteLine.commande_id,
              anteLine.id,
              anteLine,
              order.socid,
              month,
              token
            )
          );

          postLine.array_options.options_lin_datedebut =
            convertToUnix(postEndDate);
          postLine.qty = Number(postLine.qty) - overflowingPostDays;
          dispatch(
            updateOrderLine(
              postLine.commande_id,
              postLine.id,
              postLine,
              order.socid,
              month,
              token
            )
          );
        } else if (
          anteLine.array_options.options_lin_room !== regimeId &&
          postLine.array_options.options_lin_room === regimeId
        ) {
          anteLine.array_options.options_lin_datefin =
            convertToUnix(anteStartDate);
          anteLine.qty = Number(anteLine.qty) - overflowingAnteDays;
          dispatch(
            updateOrderLine(
              anteLine.commande_id,
              anteLine.id,
              anteLine,
              order.socid,
              month,
              token
            )
          );
          postLine.array_options.options_lin_datedebut =
            convertToUnix(startDate);
          postLine.qty = Number(postLine.qty) + lengthMax - overflowingPostDays;
          dispatch(
            updateOrderLine(
              postLine.commande_id,
              postLine.id,
              postLine,
              order.socid,
              month,
              token
            )
          );
        } else {
          anteLine.array_options.options_lin_datefin =
            convertToUnix(anteStartDate);
          anteLine.qty = Number(anteLine.qty) - overflowingAnteDays;
          dispatch(
            updateOrderLine(
              anteLine.commande_id,
              anteLine.id,
              anteLine,
              order.socid,
              month,
              token
            )
          );
          postLine.array_options.options_lin_datedebut =
            convertToUnix(postEndDate);
          postLine.qty = Number(postLine.qty) - overflowingPostDays;
          // dispatch update and addorderline
          const newWeekLine = {
            array_options: {
              options_lin_room: regimeId,
              options_lin_intakeplace: String(place.rowid),
              options_lin_datedebut: convertToUnix(startDate),
              options_lin_datefin: convertToUnix(endDate),
            },
            fk_product: String(id + 1),
            label: getMealLabel(id),
            qty: lengthMax,
            subprice: getMealPrice(id),
            remise_percent: 0,
          };
          dispatch(
            updateOrderLineandAddOrderline(
              postLine.commande_id,
              postLine.id,
              postLine,
              month,
              order,
              newWeekLine,
              token
            )
          );
        }
      } else if (anteLine.length === 1) {
        //ANTELINE
        console.log("ANTELINE");
        anteLine = {
          ...anteLine[0],
          array_options: { ...anteLine[0].array_options },
        };
        if (anteLine.array_options.options_lin_room === regimeId) {
          const overflowingDays =
            (anteLine.array_options.options_lin_datefin -
              convertToUnix(anteStartDate)) /
            (24 * 3600);
          anteLine.array_options.options_lin_datefin = convertToUnix(endDate);
          anteLine.qty = Number(anteLine.qty) + lengthMax - overflowingDays;
          dispatch(
            updateOrderLine(
              anteLine.commande_id,
              anteLine.id,
              anteLine,
              order.socid,
              month,
              token
            )
          );
        } else {
          console.log("ANTELINE NEW REGIME");
          const overflowingDays =
            (anteLine.array_options.options_lin_datefin -
              convertToUnix(anteStartDate)) /
            (24 * 3600);
          anteLine.array_options.options_lin_datefin =
            convertToUnix(anteStartDate);
          anteLine.qty = Number(anteLine.qty) - overflowingDays;
          const newWeekLine = {
            array_options: {
              options_lin_room: regimeId,
              options_lin_intakeplace: String(place.rowid),
              options_lin_datedebut: convertToUnix(startDate),
              options_lin_datefin: convertToUnix(endDate),
            },
            fk_product: String(id + 1),
            label: getMealLabel(id),
            qty: lengthMax,
            subprice: getMealPrice(id),
            remise_percent: 0,
          };
          dispatch(
            updateOrderLineandAddOrderline(
              anteLine.commande_id,
              anteLine.id,
              anteLine,
              month,
              order,
              newWeekLine,
              token
            )
          );
        }
      } else if (postLine.length === 1) {
        // POSTLINE
        console.log("POSTLINE");
        postLine = {
          ...postLine[0],
          array_options: { ...postLine[0].array_options },
        };
        if (postLine.array_options.options_lin_room === regimeId) {
          const overflowingDays =
            (convertToUnix(postEndDate) -
              postLine.array_options.options_lin_datedebut) /
            (24 * 3600);
          postLine.array_options.options_lin_datedebut =
            convertToUnix(startDate);
          postLine.qty = Number(postLine.qty) + lengthMax - overflowingDays;
          dispatch(
            updateOrderLine(
              postLine.commande_id,
              postLine.id,
              postLine,
              order.socid,
              month,
              token
            )
          );
        } else {
          const overflowingDays =
            (convertToUnix(postEndDate) -
              postLine.array_options.options_lin_datedebut) /
            (24 * 3600);
          postLine.array_options.options_lin_datedebut =
            convertToUnix(postEndDate);
          postLine.qty = Number(postLine.qty) - overflowingDays;
          const newWeekLine = {
            array_options: {
              options_lin_room: regimeId,
              options_lin_intakeplace: String(place.rowid),
              options_lin_datedebut: convertToUnix(startDate),
              options_lin_datefin: convertToUnix(endDate),
            },
            fk_product: String(id + 1),
            label: getMealLabel(id),
            qty: lengthMax,
            subprice: getMealPrice(id),
            remise_percent: 0,
          };
          dispatch(
            updateOrderLineandAddOrderline(
              postLine.commande_id,
              postLine.id,
              postLine,
              month,
              order,
              newWeekLine,
              token
            )
          );
        }
      } else {
        // Add week line
        dispatch(
          addOrderLine(
            order,
            month,
            {
              array_options: {
                options_lin_room: regimeId,
                options_lin_intakeplace: String(place.rowid),
                options_lin_datedebut: convertToUnix(startDate),
                options_lin_datefin: convertToUnix(endDate),
              },
              fk_product: String(id + 1),
              label: getMealLabel(id),
              qty: lengthMax,
              subprice: getMealPrice(id),
              remise_percent: 0,
            },
            token
          )
        );
      }
      if (selectedLines.length > 0) {
        selectedLines.map((line) => {
          dispatch(
            removeOrderLine(order.id, line.id, order.socid, month, token)
          );
        });
      }
    }
  };

  return (
    <>
      <Header token={token} />
      {!modalClose && !token && <LoginModal />}
      {!token ? (
        <div className="center">Veuillez vous connecter</div>
      ) : (
        <main className="container">
          <div className="center">
            <div className="center">
              {regimes && order.lines && (
                <RadioButtons
                  regimes={regimes}
                  regimeId={regimeId}
                  setRegimeId={setRegimeId}
                  lang={lang}
                />
              )}
            </div>
            <div>
              <div className="center">
                {month > mm && (
                  <FontAwesomeIcon
                    onClick={() => {
                      if (mm === month - 1) {
                        setWeek(Math.ceil(monthDay / 7));
                      } else {
                        setWeek(1);
                      }
                      setMonth(month - 1);
                    }}
                    icon="fa-solid fa-chevron-left"
                    size="xl"
                    style={{ color: "#ab0032" }}
                  />
                )}
                <h1>{convertMonth(month)}</h1>
                {month - mm < commandNb - 1 && (
                  <FontAwesomeIcon
                    onClick={() => {
                      setWeek(1);
                      setMonth(month + 1);
                    }}
                    icon="fa-solid fa-chevron-right"
                    size="xl"
                    style={{ color: "#ab0032" }}
                  />
                )}
              </div>
              <div className="center">
                {!(month === mm && week === init_week) && (
                  <FontAwesomeIcon
                    onClick={() => {
                      if (week > 1) {
                        setWeek(week - 1);
                      } else if (week === 1) {
                        setMonth(month - 1);
                        const maxWeeks = computeMaxWeeks(year, month, 1);
                        setWeek(maxWeeks);
                      }
                    }}
                    icon="fa-solid fa-chevron-left"
                    size="xl"
                    style={{ color: "#ab0032" }}
                  />
                )}
                <h1>Semaine </h1>
                {!(month - mm === commandNb - 1 && week === maxWeeks) && (
                  <FontAwesomeIcon
                    onClick={() => {
                      if (week < maxWeeks) {
                        setWeek(week + 1);
                      } else if (week === maxWeeks) {
                        setWeek(1);
                        setMonth(month + 1);
                      }
                    }}
                    icon="fa-solid fa-chevron-right"
                    size="xl"
                    style={{ color: "#ab0032" }}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="center">
            {loading && (
              <CircularProgress style={{ color: "#ab0032" }} size="30px" />
            )}
          </div>
          <div className="tables">
            {places && order.lines ? (
              places.map((place, index) => {
                return (
                  <div index={index} className="table">
                    <div className="table">
                      <div className="line">
                        <div
                          className="left-div"
                          style={{ borderRadius: "10px 10px 0 0" }}
                        >
                          <Line
                            id="dayName"
                            date={date}
                            week={week}
                            month={month}
                            place={place}
                          ></Line>
                          <Line
                            id="dayNum"
                            date={date}
                            week={week}
                            month={month}
                            place={place}
                          ></Line>
                        </div>
                      </div>
                      {ids.map((id) => {
                        return (
                          <div key={id} className="line">
                            <div
                              className="left-div"
                              id={id === maxid ? "last" : "notlast"}
                            >
                              {order.lines && (
                                <Line
                                  id={id}
                                  date={date}
                                  week={week}
                                  month={month}
                                  place={place}
                                  meals={meals}
                                  disabledMeals={disabledMeals}
                                  regimeId={regimeId}
                                ></Line>
                              )}
                            </div>
                            {filterMeals(
                              meals,
                              id,
                              week,
                              init_week,
                              firstWeekDay,
                              place.rowid,
                              mm,
                              month
                            ).length === lengthMax ? (
                              <FontAwesomeIcon
                                icon="fa-regular fa-circle-xmark"
                                size="2xl"
                                style={{ color: "#ab0032" }}
                                onClick={() => {
                                  handleWeekButtons(id, month, week, place, 1);
                                }}
                              />
                            ) : (
                              <FontAwesomeIcon
                                icon="fa-solid fa-chevron-left"
                                onClick={() => {
                                  handleWeekButtons(id, month, week, place, 0);
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="center">Réservation indisponible</div>
            )}
            {/* <div className="buttons">
              <div className="line">
                <div
                  className="left-div"
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  {order.lines && (
                    <Line
                      id="buttons"
                      date={date}
                      week={week}
                      month={month}
                      meals={meals}
                      disabledMeals={disabledMeals}
                    ></Line>
                  )}
                </div>
              </div>
            </div> */}
          </div>
        </main>
      )}
    </>
  );
}

export default App;
