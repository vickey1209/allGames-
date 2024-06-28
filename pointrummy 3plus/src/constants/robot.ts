import { UserProfileOutput } from '../interfaces/userProfile';

function robots(botId:string) : UserProfileOutput{
  
  return {
      id: botId,
      username:`Bot${botId}`,
      userId:botId,
      profilePic: 'ABC.jpg',
      // isRejoin: false,
      socketId: '',
      tableId: '',
      tableIds : [],
      lobbyId: 'BOT_LOBBY',
      gameId: "1000223",
      balance: 50000,
      entryFee : 0,
      noOfPlayer : 0,
      isPlay: false,
      isFTUE : false,
      isRobot: true,
      createdAt: new Date().toString().toString(),
      updatedAt: new Date().toString().toString(),
      latitude : "0.0",
      longitude : "0.0",
      oldTableId : [],
      gameType : 'points',
      authToken : "BOT_AUTH",
      isAnyRunningGame : false,
      isUseBot: true
    };

}

const exportedObject = {
  robots
};

export = exportedObject;
