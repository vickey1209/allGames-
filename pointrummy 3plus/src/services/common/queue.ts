import { getTableConfig, getTableFromQueue, setTableFromQueue } from "../../cache/tableConfig";
import { NUMERICAL } from "../../constants";
import { defaultTableConfig, tableQueue } from "../../interfaces/tableConfig";
import Logger from "../../logger";

async function removeQueue(tableId: string) {
    try {
        const tableConfig = await getTableConfig(tableId) as defaultTableConfig;
        const key = `${tableConfig.lobbyId}`;

        const queue: tableQueue = await getTableFromQueue(key)
        Logger.info(tableId,"removeQueue :: queue :: before >> ", queue);
        const queueTableId = queue.tableId.filter((t) => {
            return t === tableId;
        })

        if (queueTableId.length > NUMERICAL.ZERO) {
            for await (const tableID of queueTableId) {
                const queueIndex = queue.tableId.findIndex((t) => {
                    return t === tableID
                })
                if(queueIndex != NUMERICAL.MINUS_ONE) {
                    queue.tableId.splice(queueIndex, NUMERICAL.ONE);
                }
            }
            Logger.info(tableId,"removeQueue :: queue :: after >> ", queue);
            await setTableFromQueue(key, queue)
        }

    } catch (error) {
        Logger.info(tableId,"---- removeQueue :: ERROR :: " + error)
        throw error;
    }
}

async function setQueue(
    tableId: string
) {
    try {
        const tableConfig = await getTableConfig(tableId) as defaultTableConfig;
        const key = `${tableConfig.lobbyId}`;

        const queue: tableQueue = await getTableFromQueue(key);
        Logger.info(tableId,"setQueue :: queue :: before >> ", queue);
        if (queue && queue.tableId.length > NUMERICAL.ZERO) {

            const queueTableId = queue.tableId.filter((t) => {
                return t === tableId
            })

            if (queueTableId.length === NUMERICAL.ZERO) {
                queue.tableId.push(tableId)
            } else if (queueTableId.length > NUMERICAL.ONE) {
                for await (const tableID of queueTableId) {
                    const queueIndex = queue.tableId.findIndex((t) => {
                        return t === tableID
                    })
                    if(queueIndex != NUMERICAL.MINUS_ONE) {
                        queue.tableId.splice(queueIndex, NUMERICAL.ONE)
                    }
                }
                queue.tableId.push(tableId);
            }
        } else {
            queue.tableId = []
            queue.tableId.push(tableId)
        }
        Logger.info(tableId,"setQueue :: queue :: after >> ", queue);
        await setTableFromQueue(key, queue)
    } catch (error) {
        Logger.info(tableId,"---- setQueue :: ERROR :: " + error)
        throw error;
    }
}

const exportObject = {
    removeQueue,
    setQueue,
}

export = exportObject;