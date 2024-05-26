import { 
    @Vigilant,
    @TextProperty,
    @ColorProperty,
    @ButtonProperty,
    @SwitchProperty,
    @SliderProperty,
    Color,
    @NumberProperty
} from 'Vigilance';

@Vigilant("sillymod")
class settingsGUI {
    @SliderProperty({
        name: "Line limit",
        description: "Maximum amount of lines that can be displayed",
        category: "Bear GUI",
        subcategory: "General",
        min: 1,
        max: 12
    })
    lineLimit = 8;

    @ColorProperty({
        name: "Text color",
        description: "Set foreground text color.",
        category: "Bear GUI",
        subcategory: "Display Colors"
    })
    foreground = new java.awt.Color(1, 1, 1, 1);

    @ColorProperty({
        name: "Background color",
        description: "Set display background color.",
        category: "Bear GUI",
        subcategory: "Display Colors"
    })
    background = new java.awt.Color(0, 0, 0, .5);

    @SwitchProperty({
        name: "Display Background",
        description: "Toggle rendering display background",
        category: "Bear GUI",
        subcategory: "General"
    }) displayBackground = true;

    @ButtonProperty({
        name: "Move GUI",
        description: "Move Bear split GUI",
        category: "Bear GUI",
        subcategory: "Display Position"
    }) move_ui() {this.moveCommand()};

    @SliderProperty({
        name: "X Position",
        description: "Screen X position of the bear display",
        category: "Bear GUI",
        subcategory: "Display Position",
        min: 0,
        max: Renderer.screen.getWidth()
    })
    renderX = 0;

    @SliderProperty({
        name: "Y Position",
        description: "Screen Y position of the bear display",
        category: "Bear GUI",
        subcategory: "Display Position",
        min: 0,
        max: Renderer.screen.getHeight()
    })
    renderY = 0;

    constructor() {
        this.initialize(this);
        this.setCategoryDescription("Bear GUI", "§5§ka§r§d sillymod v1.1 (5/25/24 release) §5§ka")
    }
    moveCommand = () => {}
}

export const Settings = new settingsGUI();