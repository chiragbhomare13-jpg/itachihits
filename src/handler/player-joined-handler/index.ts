import HR, {PlayerJoinedEvent} from "hr-sdk";

class PlayerJoinedHandler {
    constructor(private readonly bot: HR, private readonly data: PlayerJoinedEvent){
        this.onPlayerJoined();
    }

    onPlayerJoined() {
    }

}
export default PlayerJoinedHandler