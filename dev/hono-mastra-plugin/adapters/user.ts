import { BaseAdapter, CallArgs } from "@unilab/urpc-core";
import { UserEntity } from "../entities/user";
import { stream } from "hono/streaming";

export class UserAdapter extends BaseAdapter<UserEntity> {
  async call(
    args: CallArgs<UserEntity>,
    ctx?: {
      honoCtx?: any;
      stream?: boolean;
    }
  ): Promise<UserEntity | Response> {
    if (ctx?.stream) {
      return stream(ctx?.honoCtx, async (stream) => {
        const user = {
          id: "1",
          name: "John Doe",
          email: "john.doe@example.com",
          avatar: "https://example.com/avatar.png",
        };

        // write user to stream
        await stream.write(JSON.stringify(user));
      });
    }

    return {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: "https://example.com/avatar.png",
    };
  }
}
