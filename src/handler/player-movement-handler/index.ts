import HR, { AnchorPosition, PlayerMovedEvent, Position, User } from "hr-sdk";
import cache from "../../utils/cache";
import { cacheKey } from "../../utils/constant";
import { isPosition } from "../../utils/utils";

class PlayerMovementHandler {
    private readonly position: Position | AnchorPosition;
    private readonly user: User;
    constructor(private readonly bot: HR, positionData: PlayerMovedEvent) {
        this.position = positionData.position;
        this.user = positionData.user;
        this.onPlayerMovement();
    }

    onPlayerMovement() {
        try {
            if (cache.has(cacheKey.follow) && cache.get(cacheKey.follow) === this.user.id) {
                if (isPosition(this.position)) {
                    this.bot.action.walk({
                        x: this.position.x,
                        y: this.position.y,
                        z: this.position.z,
                        facing: this.position.facing,
                    });
                }
            }
        } catch (error) {
            console.log(error)
        }
    }
}
export default PlayerMovementHandler