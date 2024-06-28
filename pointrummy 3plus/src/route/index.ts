import userPlayingLobby from '../services/userPlayingLobby';
import getPlayerOnlineCount from '../services/playerOnlineOfflineCount';
import getPlayerOnlineCountLobbyWise from '../services/playerOnlineCountLobbyWise';
import allLobbyWiseOnlinePlayer from '../services/allLobbyWiesOnlinePlayer';
import multipleLoginHandler from '../services/multipleLoginHandler';

const express = require('express');

const router = express.Router();

router.post("/userPlayingLobby", userPlayingLobby);

router.post('/getOnlinePlayerCount', getPlayerOnlineCount);
router.post('/getPlayerOnlineCountLobbyWise', getPlayerOnlineCountLobbyWise);
router.post("/allLobbyWiseOnlinePlayer", allLobbyWiseOnlinePlayer);

router.post("/multiLoginLogoutFromGameServer", multipleLoginHandler);

// router.post('/getTtackingLobby', getTrackingLobby);
// router.post('/history', getTableHistoryDetail);
// router.post('/playingTrackingFlage', playingTrackingFlage);

export = router;
