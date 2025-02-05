import HR, { PlayerLeftEvent } from "hr-sdk";

class PlayerLeftHandler {
    constructor(private readonly bot: HR, private readonly data: PlayerLeftEvent) {
        this.onPlayerLeft();
    }

    onPlayerLeft() {
    }

}
export default PlayerLeftHandler