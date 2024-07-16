import {
  GET_ORDER_BEGIN,
  GET_ORDER_SUCCESS,
  GET_ORDER_FAILURE,
  UPDATE_ORDERLINE_BEGIN,
  UPDATE_ORDERLINE_SUCCESS,
  UPDATE_ORDERLINE_FAILURE,
} from "./OrderActions";
import moment from "moment";
import config from "../../app/configuration.json";

const initialState = {
  order: {
    ref: "",
    statut: "",
    linkedObjectsIds: { facture: {} },
    linkedInvoices: [],
    customer: {
      id: "0",
      name: "",
      type: "",
      ref: "",
      array_options: { options_civility: "" },
    },
  },
  meals: [],
  disabledMeals: [],
  month: 0,
  loading: false,
  error: null,
  orderToCloseEnd: false,
};
export default function OrderReducer(state = initialState, action) {
  const codeRepas = config.codeRepas;

  switch (action.type) {
    // *** Get Order
    case GET_ORDER_BEGIN:
      return {
        ...state,
        order: {
          ref: "",
          statut: "",
          linkedObjectsIds: { facture: {} },
          linkedInvoices: [],
          customer: {
            id: "0",
            name: "",
            type: "",
            ref: "",
            array_options: { options_civility: "" },
          },
        },
        loading: true,
        error: null,
      };

    case GET_ORDER_SUCCESS:
      let orderLines = {};
      let month = "";
      orderLines = action.payload.order.lines;
      const refline = orderLines.filter((line) => line.ref === codeRepas);
      month = new Date(
        moment.unix(refline[0].array_options.options_lin_datedebut)
      ).getMonth();
      return {
        ...state,
        loading: false,
        order: action.payload.order,
        month: month,
      };

    case GET_ORDER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        order: {
          ref: "",
          statut: "",
          linkedObjectsIds: { facture: {} },
          linkedInvoices: [],
          customer: { name: "" },
        },
      };

    // *** Update order lines
    case UPDATE_ORDERLINE_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case UPDATE_ORDERLINE_SUCCESS:
      return {
        ...state,
        loading: false,
      };

    case UPDATE_ORDERLINE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    default:
      // ALWAYS have a default case in a reducer
      return state;
  }
}
