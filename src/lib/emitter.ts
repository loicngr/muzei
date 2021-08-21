import mitt from "mitt";
import { Events as MittEvents } from "@/utils/types/events";

export const emitter = mitt<MittEvents>();
