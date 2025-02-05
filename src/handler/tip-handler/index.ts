import HR, { TipEvent } from "hr-sdk";
import hrCache from "../../utils/cache";
import logger from "../../lib/winston";
import BotTipHandler from "./tip-manager/BotTipHandler";

class TipHandler {
    constructor(private readonly bot: HR, private readonly data: TipEvent) {
        this.onTip();
    }

    onTip() {
        console.log(this.data.item);
        console.log(this.data.receiver);
        console.log(this.data.sender);
        if (this.data.receiver.id === hrCache.get('botId')) {
            const botTipHandler = new BotTipHandler(this.data);
            botTipHandler.botTipHandler();
            logger.info("Tip received: " + this.data.item.amount);
        }
    }

}
export default TipHandler