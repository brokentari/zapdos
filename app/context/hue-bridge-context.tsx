import {
  createContext,
  useContext,
  ReactNode,
  SetStateAction,
  Dispatch,
  useState,
} from "react";

interface HueStateContextType {
  hueUrl: string;
  setHueUrl: Dispatch<SetStateAction<string>>;
}

export const HueStateContext = createContext<HueStateContextType>({
  hueUrl: "",
  setHueUrl: () => {},
});

type HueContextProviderProps = {
  children?: ReactNode;
  value: string;
};

export const HueContextProvider = ({
  children,
  value,
}: HueContextProviderProps) => {
  const [hueUrl, setHueUrl] = useState(value);

  return (
    <HueStateContext.Provider value={{ hueUrl, setHueUrl }}>
      {children}
    </HueStateContext.Provider>
  );
};

export const useHueStateContext = () => useContext(HueStateContext);
