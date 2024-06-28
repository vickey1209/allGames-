import { shuffleCards } from '../../common';
import { NUMERICAL, SHUFFLE_CARDS } from '../../constants';
import Logger from "../../logger";

export interface cardsAndScoreInterface {
  card: Array<string>;
  points: number;
}
export interface shuffleCardData {
  cardAndPoint: Array<cardsAndScoreInterface>;
  closedDeck: Array<string>;
  opendDeck: Array<string>;
  trumpCard: Array<string>;
}

async function setDistributedCard(
  maximumPlayerCount: number,
  totalActivePlayer: number,
  tableId: string,
): Promise<shuffleCardData> {
  try {
    Logger.info(tableId,'totalActivePlayer :>> ', totalActivePlayer);
    let cardArray = [];
    const cards = [];
    let s1_card = [];
    let s2_card = [];
    let s3_card = [];
    let s4_card = [];
    let s5_card = [];
    let s6_card = [];
    let s1_points;
    let s2_points;
    let s3_points;
    let s4_points;
    let s5_points;
    let s6_points;

    // cardArray = SHUFFLE_CARDS.DECK_ONE;
    cardArray = SHUFFLE_CARDS.DECK_ONE.concat(SHUFFLE_CARDS.DECK_TWO).concat(SHUFFLE_CARDS.JOKER);
    // cardArray = [
    //   'S_14_0_1',
    //   'S_2_0_1',
    //   'S_3_0_1',
    //   'S_4_0_1',
    //   'S_5_0_1',
    //   'S_6_0_1',
    //   'S_7_0_1',
    //   'S_8_0_1',
    //   'S_9_0_1',
    //   'S_10_0_1',
    //   'S_11_0_1',
    //   'S_12_0_1',
    //   'S_13_0_1',
    //   'C_14_0_1',
    //   'C_2_0_1',
    //   'C_3_0_1',
    //   'C_4_0_1',
    //   'C_5_0_1',
    //   'C_6_0_1',
    //   'C_7_0_1',
    //   'C_8_0_1',
    //   'C_9_0_1',
    //   'C_10_0_1',
    //   'C_11_0_1',
    //   'C_12_0_1',
    //   'C_13_0_1',
    //   'H_14_0_1',
    //   'H_2_0_1',
    //   'H_3_0_1',
    //   'H_4_0_1',
    //   'H_5_0_1',
    //   'H_6_0_1',
    //   'H_7_0_1',
    //   'H_8_0_1',
    // ]
    Logger.info(tableId,'Defalt 2-Deck cardArray.length :>> ', cardArray.length);

    /** Create joker */
    const jokerCard = Math.floor(Math.random() * cardArray.length);
    let jokar = cardArray.splice(jokerCard, NUMERICAL.ONE)[0];
    if (jokar == 'J_J_J_1' || jokar == 'J_J_J_2') { jokar = 'S_14_0_1'; }
    const trumpCard: string[] = [jokar];
    Logger.info(tableId,"trumpCard :: ", trumpCard);

    let value = jokar.split('_');
    cardArray = cardArray.map((ele, ind) => {
      let tempcard = ele.split('_');
      if (tempcard[1] == value[1]) {
        return ele = `${tempcard[0]}_${tempcard[1]}_J_${tempcard[3]}`;
      }
      return ele;
    })
    Logger.info(tableId,'cardArray updated with joker and wlid card :>> ', cardArray);

    const twoDeck = cardArray;
    const shuffle = shuffleCards(twoDeck);
    cardArray = shuffleCards(shuffle);

    const opendDeck: string[] = cardArray.splice(0, NUMERICAL.ONE);
    Logger.info(tableId," opendDeck :: ", opendDeck);

    if (totalActivePlayer == NUMERICAL.ONE) {
      s1_card = cardArray.splice(0, NUMERICAL.THIRTEEN);

      s1_points = await pointCalculate(s1_card);
      cards.push({ card: s1_card, points: s1_points });
    }

    if (totalActivePlayer == NUMERICAL.TWO) {
      s1_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s2_card = cardArray.splice(0, NUMERICAL.THIRTEEN);

      // s1_card = ['S_2_0_1', 'S_3_0_1', 'S_4_0_1', 'S_5_0_1', 'S_6_0_1', 'S_7_0_1', 'S_8_0_1', 'S_9_0_1', 'S_10_0_1', 'S_11_0_1', 'S_12_0_1', 'S_13_0_1', 'J_J_J_1'];
      // s2_card = ['S_2_0_1', 'S_3_0_1', 'S_4_0_1', 'S_5_0_1', 'S_6_0_1', 'S_7_0_1', 'S_8_0_1', 'S_9_0_1', 'S_10_0_1', 'S_11_0_1', 'S_12_0_1', 'S_13_0_1', 'J_J_J_1'];

      s1_points = await pointCalculate(s1_card);
      s2_points = await pointCalculate(s2_card);

      cards.push({ card: s1_card, points: s1_points });
      cards.push({ card: s2_card, points: s2_points });
    }

    if (totalActivePlayer == NUMERICAL.THREE) {
      s1_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s2_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s3_card = cardArray.splice(0, NUMERICAL.THIRTEEN);

      s1_points = await pointCalculate(s1_card);
      s2_points = await pointCalculate(s2_card);
      s3_points = await pointCalculate(s3_card);

      cards.push({ card: s1_card, points: s1_points });
      cards.push({ card: s2_card, points: s2_points });
      cards.push({ card: s3_card, points: s3_points });
    }

    if (totalActivePlayer == NUMERICAL.FOUR) {
      s1_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s2_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s3_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s4_card = cardArray.splice(0, NUMERICAL.THIRTEEN);

      s1_points = await pointCalculate(s1_card);
      s2_points = await pointCalculate(s2_card);
      s3_points = await pointCalculate(s3_card);
      s4_points = await pointCalculate(s4_card);

      cards.push({ card: s1_card, points: s1_points });
      cards.push({ card: s2_card, points: s2_points });
      cards.push({ card: s3_card, points: s3_points });
      cards.push({ card: s4_card, points: s4_points });
    }

    if (totalActivePlayer == NUMERICAL.FIVE) {
      s1_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s2_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s3_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s4_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s5_card = cardArray.splice(0, NUMERICAL.THIRTEEN);

      s1_points = await pointCalculate(s1_card);
      s2_points = await pointCalculate(s2_card);
      s3_points = await pointCalculate(s3_card);
      s4_points = await pointCalculate(s4_card);
      s5_points = await pointCalculate(s5_card);

      cards.push({ card: s1_card, points: s1_points });
      cards.push({ card: s2_card, points: s2_points });
      cards.push({ card: s3_card, points: s3_points });
      cards.push({ card: s4_card, points: s4_points });
      cards.push({ card: s5_card, points: s5_points });
    }

    if (totalActivePlayer == NUMERICAL.SIX) {
      s1_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s2_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s3_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s4_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s5_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s6_card = cardArray.splice(0, NUMERICAL.THIRTEEN);

      s1_points = await pointCalculate(s1_card);
      s2_points = await pointCalculate(s2_card);
      s3_points = await pointCalculate(s3_card);
      s4_points = await pointCalculate(s4_card);
      s5_points = await pointCalculate(s5_card);
      s6_points = await pointCalculate(s6_card);

      cards.push({ card: s1_card, points: s1_points });
      cards.push({ card: s2_card, points: s2_points });
      cards.push({ card: s3_card, points: s3_points });
      cards.push({ card: s4_card, points: s4_points });
      cards.push({ card: s5_card, points: s5_points });
      cards.push({ card: s6_card, points: s6_points });
    }
    
    return { cardAndPoint: cards, closedDeck: cardArray, opendDeck, trumpCard };
  }
  catch (e) {
    Logger.error(tableId,'setDistributedCard error', e);
    throw new Error('setDistributedCard error');
  }
}


async function pointCalculate(cards: any[]): Promise<number> {
  let arrNumber: any[] = [];
  cards.map((ele) => {
    let arr = ele.split('_');
    if (arr[NUMERICAL.TWO] == String(NUMERICAL.ZERO)) {
      (arr[NUMERICAL.ONE] > NUMERICAL.TEN)
        ? arrNumber.push(NUMERICAL.TEN)
        : arrNumber.push(Number(arr[NUMERICAL.ONE]))
    }
  })
  const sum: number = arrNumber.reduce((partialSum, a) => partialSum + a, 0);
  let res: number = (sum > NUMERICAL.EIGHTY) ? NUMERICAL.EIGHTY : sum;

  return res;

}

export { setDistributedCard, pointCalculate };
