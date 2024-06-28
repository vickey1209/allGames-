const REDIS = {
      LIST: 'list',
      DECK: 'deck',
      MOVE: 'move',
      QUEUE: 'queue',
      HASH: 'hash',
      PLAYER: 'player',
      USER: 'user',
      DISCONNECTED: 'dis',
      GAME_TABLE: 'T',
      ROUND: 'R',
      PLAYER_GAME_PLAY: 'PGP',
      ROUND_SCOREBOARD: 'RSB',
      TABLE_GAME_PLAY: 'TGP',
      SORTED_SET_KEY: 'tableId',
      TURN_HISTORY: 'history',
      LAST_DEAL: 'lastDeal',
      GAME_OVER_AFTER_REMAIN_USERS: `GO_remain_users_history`,
      ONLINEPLAYER: 'activePlayer',
      ONLINE_PLAYER_LOBBY: 'activePlayerInLobby',
      TRACKEDLOBBY: "trackedLobby",
      LOBBY_DETAIL: 'lobbyDetail',
      ONLINE_USER_COUNTER: 'online_player'
};

const exportObject = REDIS;

export = exportObject;
