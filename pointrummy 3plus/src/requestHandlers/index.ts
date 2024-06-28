import saveCardsInSortsHandler from "./saveCardsInSorts";
import pickCardFormCloseDackHandler from "./pickCardFormCloseDack";
import pickCardFormOpenDackHandler from "./pickCardFormOpenDack";
import discardCardHandler from "./discardCardHandler";
import groupCardHandler from "./groupCardHandler";
import endDragCardHandler from "./endDragCardHandler";
import openDeckCardsHandler from "./openDeckCardsHandler";
import finishHandler from "./finishHandler";
import EVENT from "../constants/event";
import declareHandler from "./declareHandler";
import dropHandler from "./dropHandler";
import leaveTableHandler from "./leaveTableHandler";
import hearBeat from "./hearBeatHandler";
import gameTableInfoHandler from "./getTableInfo";
import Logger from "../logger";
import lastDealHandler from "./lastDealHandler";
import signUpHandler from "./signupHandler";
import rejoinOrNewGameHandler from "./rejoinOrNewGameHandler";
import switchTableHandler from "./switchTableHandler";
import showSettingMenuHelpInfoHelper from "./settingHelpMenu";
import { joinTable } from "../services/playTable/joinTable";

async function requestHandler(
    this: any,
    [reqEventName, payload, ack]: Array<any>,
    // @ts-ignore
    next
    // socket:any, body:any
) {
    try {
  
        const socket: any = this;
        const body = typeof payload == 'string' ? JSON.parse(payload) : payload;
        if (reqEventName !== EVENT.HEART_BEAT_SOCKET_EVENT) {
            Logger.info("-------------------------------------------------------------------------------------------------------------------------")
            Logger.info("EVENT : UNITY-SIDE ============>>", reqEventName, body)
            Logger.info("-------------------------------------------------------------------------------------------------------------------------")
        }
        let response: any;
        switch (reqEventName) {

            case EVENT.HEART_BEAT_SOCKET_EVENT:
                response = await hearBeat(socket, body.data);
                break;

            case EVENT.SIGN_UP_SOCKET_EVENT: //User signUp 
                let isRejoinOrNewGame = true;
                response = await signUpHandler(socket, body.data, isRejoinOrNewGame, ack);
                Logger.info("Before Join Table : response :: ===>>", response);

                if (response && response && 'tableId' in response && !response['reconnect'])
                    await joinTable(response, socket, false);
                if (response && response['reconnect']) await joinTable(response, socket, true);
                break;

            case EVENT.SAVE_CARDS_IN_SORTS_SOCKET_EVENT: // Save Cards In Groups
                response = await saveCardsInSortsHandler(socket, body.data);
                break;

            case EVENT.PICK_FROM_CLOSE_DECK_SOCKET_EVENT: // Pick From Close Deck
                response = await pickCardFormCloseDackHandler(socket, body.data);
                break;

            case EVENT.PICK_FROM_OPEN_DECK_SOCKET_EVENT: // Pick From Open Deck
                response = await pickCardFormOpenDackHandler(socket, body.data);
                break;

            case EVENT.DISCARD_CARD_SOCKET_EVENT: // Discard Card - Throw Card After Pick Card
                response = await discardCardHandler(socket, body.data);
                break;

            case EVENT.GROUP_CARD_SOCKET_EVENT: // Group Card - manually
                response = await groupCardHandler(socket, body.data);
                break;

            case EVENT.END_DRAG_SOCKET_EVENT: // End drag Card
                response = await endDragCardHandler(socket, body.data);
                break;

            case EVENT.SHOW_OPENDECK_CARDS_EVENT: // Show open deck cards
                response = await openDeckCardsHandler(socket, body.data);
                break;

            case EVENT.FINISH_SOCKET_EVENT: // Finish
                response = await finishHandler(socket, body.data);
                break;

            case EVENT.DECLARE_SOCKET_EVENT: // Declare
                response = await declareHandler(socket, body.data);
                break;

            case EVENT.DROP_SOCKET_EVENT: // Drop
                response = await dropHandler(socket, body.data);
                break;

            case EVENT.LEAVE_TABLE_SOCKET_EVENT: // Leave
                response = await leaveTableHandler(socket, body.data);
                break;

            case EVENT.SETTING_MENU_GAME_TABLE_INFO_SOCKET_EVENT: //GTI
                response = await gameTableInfoHandler(socket, body.data);
                break;

            case EVENT.LAST_DEAL_SOCKET_EVENT: //Last Deal
                response = await lastDealHandler(socket, body.data);
                break;

            case EVENT.REJOIN_OR_NEW_GAME_SOCKET_EVENT:
                response = await rejoinOrNewGameHandler(socket, body.data, ack);
                break;

            case EVENT.SWITCH_TABLE_SOCKET_EVENT:  //drop and move
                response = await switchTableHandler(socket, body.data, ack);
                break;

            case EVENT.GAME_SETTING_MENU_HELP_SOCKET_EVENT: // Game setting menu help
                response = await showSettingMenuHelpInfoHelper(body.data, socket);
                break;

            default:
                Logger.info("<<====== Default Event :: Call ========>>");
                break;

        };
    } catch (error) {
        Logger.info('requestHandler ::  :==>>> ', error);

    }
}
export = requestHandler;


