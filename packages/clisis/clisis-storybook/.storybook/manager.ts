import { addons, types } from "storybook/manager-api"
import { ThemeTool } from "./theme-tool"

addons.register("clisisCoder/theme-toggle", () => {
  addons.add("clisisCoder/theme-toggle/tool", {
    type: types.TOOL,
    title: "Theme",
    match: ({ viewMode }) => viewMode === "story" || viewMode === "docs",
    render: ThemeTool,
  })
})
