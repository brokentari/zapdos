import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from "@remix-run/react";
import { useHueStateContext } from "@/context/hue-bridge-context";

export declare interface HueRoomArgs {
  id: string;
  name: string;
  any_on: boolean;
  brightness: number;
}

export default function HueRoom({ id, name, any_on, brightness }: HueRoomArgs) {
  const { hueUrl } = useHueStateContext();
  const nagivate = useNavigate();

  const toggleLightState = async (new_on_state: boolean) => {
    try {
      await fetch(`${hueUrl}/groups/${id}/action`, {
        method: "PUT",
        body: JSON.stringify({ on: new_on_state }),
      });

      nagivate(".", { replace: true });
    } catch (error) {
      console.error(error);
    }
  };

  const handleBrightness = async (new_brightness: number[]) => {
    let inc_dec_val = new_brightness[0] - brightness;
    if (inc_dec_val === 255) inc_dec_val--;
    if (inc_dec_val === -255) inc_dec_val++;

    try {
      await fetch(`${hueUrl}/groups/${id}/action`, {
        method: "PUT",
        body: JSON.stringify({ bri_inc: inc_dec_val }),
      });

      nagivate(".", { replace: true });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card key={id}>
      <CardHeader className="flex flex-row justify-between">
        <CardTitle>{name}</CardTitle>
        <Switch
          id={name}
          checked={any_on}
          onCheckedChange={(on: boolean) => toggleLightState(on)}
        />
      </CardHeader>
      <CardContent className="flex flex-row justify-between">
        {any_on && (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 pr-4">
              Brightness
            </p>
            <Slider
              className="w-full mt-2"
              id="living-room-brightness"
              disabled={!any_on}
              max={255}
              step={1}
              defaultValue={[brightness]}
              onValueCommit={(val: number[]) => handleBrightness(val)}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
