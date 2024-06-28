import { NUMERICAL } from "../constants";

async function cardGroups(cards: string[]): Promise<any> {

    const spade: any[] = [];
    const club: any[] = [];
    const heart: any[] = [];
    const diamond: any[] = [];
    const joker: any[] = [];
    const Arraygroup: any[] = [];

    await cards.map((ele, ind) => {
        let arr = ele.split('_');
        if (arr[NUMERICAL.ZERO] == 'S') { spade.push(ele); }
        if (arr[NUMERICAL.ZERO] == 'C') { club.push(ele); }
        if (arr[NUMERICAL.ZERO] == 'H') { heart.push(ele); }
        if (arr[NUMERICAL.ZERO] == 'D') { diamond.push(ele); }
        if (arr[NUMERICAL.ZERO] == 'J') { joker.push(ele); }
    })

    if (spade.length != NUMERICAL.ZERO) { Arraygroup.push(spade) }
    if (club.length != NUMERICAL.ZERO) { Arraygroup.push(club) }
    if (heart.length != NUMERICAL.ZERO) { Arraygroup.push(heart) }
    if (diamond.length != NUMERICAL.ZERO) { Arraygroup.push(diamond) }
    if (joker.length != NUMERICAL.ZERO) { Arraygroup.push(joker) }

    return Arraygroup;
}
function sortCard(cardsArr: string[]) {

    let numArr: any[] = [];
    let numArr_with_index: any[] = [];
    let indexe: any[] = [];
    let sortingPair: any[] = [];

    cardsArr.map((ele, ind) => {
        let arr = ele.split('_');
        numArr.push(Number(arr[NUMERICAL.ONE]));
    })

    numArr.map((ele, ind) => {
        numArr_with_index.push([ele, ind])
    })

    numArr_with_index.sort((a, b) => { return a[0] - b[0] });

    numArr_with_index.map((ele, ind) => {
        indexe.push(Number(numArr_with_index[ind][NUMERICAL.ONE]));
    })

    indexe.map((ele, ind) => {
        sortingPair.push(cardsArr[ele])
    })
    return sortingPair;
}
function isPure(card: string[]): any {
    let typeCard: string[] = [];
    let numArr: number[] = [];
    let typeArr: any[] = [];
    let deckNo : any[] = [];
    let newCard = [];

    card.map((ele, ind) => {
        let arr = ele.split('_');
        typeCard.push(arr[NUMERICAL.ZERO]);
        numArr.push(Number(arr[NUMERICAL.ONE]));
        typeArr.push(arr[NUMERICAL.TWO]);
        deckNo.push(arr[NUMERICAL.THREE]);
    })

    const allEqual = typeArr.every(val => val == NUMERICAL.ZERO);
    const cardLatter = typeCard.every((val) => val === typeCard[NUMERICAL.ZERO])

    const res = numArr.map((ele, ind) => {
        if ((ele + NUMERICAL.ONE) == numArr[ind + NUMERICAL.ONE]) return true;
        else return false;
    })

    if (typeCard.includes('J')) return false
    else if (typeArr.includes('J')) {
        if (card.length > NUMERICAL.TWO && res.indexOf(false) == res.length - NUMERICAL.ONE && cardLatter) return true;
        else if (numArr.includes(NUMERICAL.FOURTEEN)) {
            var index = numArr.indexOf(NUMERICAL.FOURTEEN);
            if (index) {
                numArr[index] = NUMERICAL.ONE;
                for (let i = NUMERICAL.ZERO; i < card.length; i++) {
                    newCard.push(`${typeCard[i]}_${numArr[i]}_${typeArr[i]}_${deckNo[i]}`)
                }
                newCard = sortCard(newCard);
                return isPure(newCard);
            } else {
                return false;
            }
        }
        else return false;
    }
    else {
        if (card.length > NUMERICAL.TWO && res.indexOf(false) == res.length - NUMERICAL.ONE && allEqual && cardLatter) { return true }
        else if (numArr.includes(NUMERICAL.FOURTEEN)) {
            var index = numArr.indexOf(NUMERICAL.FOURTEEN);
            if (index) {
                numArr[index] = NUMERICAL.ONE;
                for (let i = NUMERICAL.ZERO; i < card.length; i++) {
                    newCard.push(`${typeCard[i]}_${numArr[i]}_${typeArr[i]}_${deckNo[i]}`)
                }
                newCard = sortCard(newCard);
                return isPure(newCard);
            } else {
                return false;
            }
        }
        else return false;
    }
}
function isImpure(card: string[]): any {
    let typeCard: string[] = [];
    let numArr: string[] = [];
    let typeArr: any[] = [];
    let deckNo : any[] = [];


    card.map((ele, ind) => {
        let arr = ele.split('_');
        typeCard.push(arr[NUMERICAL.ZERO]);
        numArr.push(arr[NUMERICAL.ONE]);
        typeArr.push(arr[NUMERICAL.TWO]);
        deckNo.push(arr[NUMERICAL.THREE]);
    })

    var cardJW = [];
    var cardWithOutJW: any[] = [];
    var typeCardWithOutJW: any[] = [];
    var numArrWithOutJW: any[] = [];
    var typeArrWithOutJW: any[] = [];
    var diffArr: any[] = [];
    var gapCount = 0;
    var newCard = [];

    typeArr.map((ele, ind) => {
        if (ele == 'J') cardJW.push(card[ind]);
        else cardWithOutJW.push(card[ind]);
    })

    cardWithOutJW.map((ele, ind) => {
        let arrWithOutJW = ele.split('_');
        typeCardWithOutJW.push(arrWithOutJW[NUMERICAL.ZERO])
        numArrWithOutJW.push(Number(arrWithOutJW[NUMERICAL.ONE]));;
        typeArrWithOutJW.push(arrWithOutJW[NUMERICAL.TWO]);
    })

    const cardLatter = typeCardWithOutJW.every((val) => val === typeCardWithOutJW[NUMERICAL.ZERO])
    let numberLatter = numArrWithOutJW.some((val, i) => numArrWithOutJW.indexOf(val) !== i);
    numArrWithOutJW.sort(function (left, right) { return left < right ? -1 : 1; });

    for (let i = 0; i < numArrWithOutJW.length - 1; i++) {
        const ele = numArrWithOutJW[i];
        diffArr.push((numArrWithOutJW[i + NUMERICAL.ONE] - ele));
    }

    diffArr.map(ele => {
        if (ele > NUMERICAL.ONE) {
            let num = ele - NUMERICAL.ONE;
            gapCount = gapCount + num;
        }
    })


    if (numberLatter) {
        return false;
    }
    else if ((card.length > NUMERICAL.TWO && !numberLatter && cardLatter && cardJW.length >= gapCount) || (card.length > NUMERICAL.TWO && cardLatter && gapCount == NUMERICAL.ZERO)) {
        return true;
    }
    else {
        if ((numArrWithOutJW.includes(NUMERICAL.FOURTEEN))) {
            var index = numArr.indexOf(`${NUMERICAL.FOURTEEN}`);
            if (index != NUMERICAL.MINUS_ONE) {
                numArr[index] = `${NUMERICAL.ONE}`;
                for (let i = NUMERICAL.ZERO; i < card.length; i++) {
                    newCard.push(`${typeCard[i]}_${numArr[i]}_${typeArr[i]}_${deckNo[i]}`)
                }
                newCard = sortCard(newCard);
                return isImpure(newCard);
            } else {
                return false
            }
        }
        else {
            return false
        }
    }

}
function isSet(card: string[]) {

    let typeCard: string[] = [];
    let numArr: number[] = [];
    let typeArr: any[] = [];

    card.map((ele, ind) => {
        let arr = ele.split('_');
        typeCard.push(arr[NUMERICAL.ZERO])
        numArr.push(Number(arr[NUMERICAL.ONE]));;
        typeArr.push(arr[NUMERICAL.TWO])
    })

    var cardJW = [];
    var cardWithOutJW: any[] = [];
    var typeCardWithOutJW: any[] = [];
    var numArrWithOutJW: any[] = [];
    var typeArrWithOutJW: any[] = [];

    typeArr.map((ele, ind) => {
        if (ele == 'J') cardJW.push(card[ind]);
        else cardWithOutJW.push(card[ind]);
    })

    cardWithOutJW.map((ele, ind) => {
        let arrWithOutJW = ele.split('_');
        typeCardWithOutJW.push(arrWithOutJW[NUMERICAL.ZERO])
        numArrWithOutJW.push(Number(arrWithOutJW[NUMERICAL.ONE]));;
        typeArrWithOutJW.push(arrWithOutJW[NUMERICAL.TWO]);
    })

    const allNumberSame = numArrWithOutJW.every((val) => val === numArrWithOutJW[0])
    var allSameSuitCount_S = NUMERICAL.ZERO;
    var allSameSuitCount_C = NUMERICAL.ZERO;
    var allSameSuitCount_H = NUMERICAL.ZERO;
    var allSameSuitCount_D = NUMERICAL.ZERO;

    typeCardWithOutJW.map((ele) => {
        if (ele == 'S') allSameSuitCount_S++;
        if (ele == 'C') allSameSuitCount_C++;
        if (ele == 'H') allSameSuitCount_H++;
        if (ele == 'D') allSameSuitCount_D++;
    })

    if (card.length > NUMERICAL.TWO && allNumberSame && allSameSuitCount_S < NUMERICAL.TWO && allSameSuitCount_C < NUMERICAL.TWO && allSameSuitCount_H < NUMERICAL.TWO && allSameSuitCount_D < NUMERICAL.TWO && card.length < NUMERICAL.FIVE) {
        return true
    }
    else {
        return false
    }

}
function arraySum(point: number[]) {
    const sum: number = point.reduce((partialSum, a) => partialSum + a, 0);
    let res: number = (sum > NUMERICAL.EIGHTY) ? NUMERICAL.EIGHTY : sum;
    return res;
}

const exportedObject = {
    cardGroups,
    sortCard,
    isPure,
    isImpure,
    isSet,
    arraySum
};
export = exportedObject;