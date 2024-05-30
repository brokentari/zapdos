import { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import HueRoom, { HueRoomArgs } from "./hue-room";
import { hueAuth } from "@/lib/util";


// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function  collectRooms(rooms: any): HueRoomArgs[] {
  const result = [] as HueRoomArgs[];
  for (const key in rooms) {
    // biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
if  (rooms.hasOwnProperty(key) && rooms[key].type === "Room") {
      const curr_room_args = {
        name: rooms[key].name,
        brightness: rooms[key].action.bri,
        any_on: rooms[key].state.any_on,
        id: key,
      } as HueRoomArgs;

      result.push(curr_room_args);
    }
  }

  return result;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await hueAuth.parse(cookieHeader)) || {};

  const hueUrl = cookie.url as string;
  try {
    const roomsResponse = await fetch(`${hueUrl}/groups`);
    if (roomsResponse.ok) {
      const rooms = await roomsResponse.json();
      const collectedRooms = collectRooms(rooms);
      console.log(collectRooms(rooms));
      return json({ success: true, rooms: collectedRooms });
    }
      return json({ success: false, rooms: [] });
  } catch (error) {
    if (typeof error === "string") {
      return json({ success: false, rooms: [] });
    }if (error instanceof Error) {
      return json({ success: false, rooms: [] });
    }
  }
}

export default function Rooms() {
  const { success, rooms } = useLoaderData<typeof loader>();

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <h2 className="mb-6 text-2xl font-bold md:text-3xl">Rooms</h2>
      <div className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {success &&
          rooms.map((arg) => (
            <HueRoom
              key={arg.name}
              id={arg.id}
              name={arg.name}
              any_on={arg.any_on}
              brightness={arg.brightness}
            />
          ))}
      </div>
    </main>
  );
}
