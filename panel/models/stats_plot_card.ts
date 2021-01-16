import { HTMLBox, HTMLBoxView } from "@bokehjs/models/layouts/html_box"
import {build_view} from "@bokehjs/core/build_views"
import { Plot } from "@bokehjs/models/plots"
import { VBar } from "@bokehjs/models/glyphs/vbar"
import { Line } from "@bokehjs/models/glyphs/line"
import { Step } from "@bokehjs/models/glyphs/step"
import { VArea } from "@bokehjs/models/glyphs/varea"
import * as p from "@bokehjs/core/properties"
import {div} from "@bokehjs/core/dom"
import {ColumnDataSource} from "@bokehjs/models/sources/column_data_source"

export class StatsPlotCardView extends HTMLBoxView {
    model: StatsPlotCard
    textDiv: HTMLDivElement
    titleDiv: HTMLDivElement
    valueDiv: HTMLDivElement
    value2Div: HTMLDivElement
    plotDiv: HTMLDivElement
    plot: Plot

    initialize(): void {
        super.initialize()
        this.titleDiv = div({style: "font-size: 1em"})
        this.valueDiv = div({style: "font-size: 2em"})
        this.value2Div = div({style: "font-size: 1em; opacity: 0.5"})
        this.textDiv = div({style: "height: 50%; width: 100%;"}, this.titleDiv, this.valueDiv, this.value2Div)

        this.updateTitle()
        this.updateValue()
        this.updateValue2()
        this.updateTextFontSize()

        this.plotDiv = div({style: "height: 50%; width: 100%;"})
      }

    connect_signals(): void {
        super.connect_signals()

        this.connect(this.model.properties.title.change, () => {
            this.updateTitle();this.updateTextFontSize();
        })
        this.connect(this.model.properties.value.change, () => {
            this.updateValue();this.updateTextFontSize();
        })
        this.connect(this.model.properties.value2.change, () => {
            this.updateValue2();this.updateTextFontSize();
        })
        this.connect(this.model.properties.plot_color.change, () => {
            this.render();
        })
        this.connect(this.model.properties.plot_type.change, () => {
            this.render();
        })
        this.connect(this.model.properties.width.change, () => {
            this.render();
        })
        this.connect(this.model.properties.height.change, () => {
            this.render();
        })
        this.connect(this.model.properties.sizing_mode.change, () => {
            this.render();
        })
    }

    async render(): Promise<void> {
        super.render()
        this.el.innerHTML=""
        this.el.appendChild(this.textDiv)
        this.el.appendChild(this.plotDiv)
        await this.setPlot()
    }
    private async setPlot() {
        this.plot = new Plot({
            toolbar_location: null,
            background_fill_color: null,
            border_fill_color: null,
            outline_line_color: null,
            min_border: 0,
            sizing_mode: "stretch_both"
        })
        var source = <ColumnDataSource>this.model.plot_data
        if (this.model.plot_type==="line"){
            var line = new Line({
                x: { field: this.model.plot_x },
                y: { field: this.model.plot_y },
                line_width: 6,
                line_color: this.model.plot_color,
            })
            this.plot.add_glyph(line, source)
        } else if (this.model.plot_type==="step"){
            var step = new Step({
                x: { field: this.model.plot_x },
                y: { field: this.model.plot_y },
                line_width: 6,
                line_color: this.model.plot_color,
            })
            this.plot.add_glyph(step, source)
        } else if (this.model.plot_type==="area") {
            var varea = new VArea({
                x: { field: this.model.plot_x },
                y1: { field: this.model.plot_y },
                y2: 0,
                fill_color: this.model.plot_color,
                fill_alpha: 0.5,
            })
            this.plot.add_glyph(varea, source)
            var line = new Line({
                x: { field: this.model.plot_x },
                y: { field: this.model.plot_y },
                line_width: 3,
                line_color: this.model.plot_color,
            })
            this.plot.add_glyph(line, source)
        } else {
            var vbar = new VBar({
                x: { field: this.model.plot_x },
                top: { field: this.model.plot_y },
                width: 0.9,
                line_color: null,
                fill_color: this.model.plot_color
            })
            this.plot.add_glyph(vbar, source)
        }

        // hover = p.select(dict(type=HoverTool))
        // hover.tooltips = [("x", "@x"), ("top", "@top"),]
        // hover.mode = 'mouse'
        const view = await build_view(this.plot)
        this.plotDiv.innerHTML=""
        view.renderTo(this.plotDiv)
    }

    after_layout(): void {
        super.after_layout()
        this.updateTextFontSize()
    }
    updateTextFontSize(): void {
        this.updateTextFontSizeColumn();
    }
    updateTextFontSizeColumn(): void {
        const elWidth = this.el.clientWidth;
        const elHeight = this.el.clientHeight;

        const widthTitle = 1*this.model.title.length
        const widthValue = 2*this.model.value.length
        const widthValue2 = 1*this.model.value2.length

        const widthConstraint1 = elWidth/widthTitle*2.0
        const widthConstraint2 = elWidth/widthValue*1.8
        const widthConstraint3 = elWidth/widthValue2*2.0
        const heightConstraint = elHeight/10

        const fontSize = Math.min(widthConstraint1, widthConstraint2, widthConstraint3, heightConstraint)
        this.textDiv.style.fontSize = Math.trunc(fontSize) + "px";
        this.textDiv.style.lineHeight = "1.3";
    }
    updateTitle(): void {
        this.titleDiv.innerText=this.model.title
    }
    updateValue(): void {
        this.valueDiv.innerText=this.model.value
    }
    updateValue2(): void {
        this.value2Div.innerText=this.model.value2
    }
}

export namespace StatsPlotCard {
    export type Attrs = p.AttrsOf<Props>
    export type Props = HTMLBox.Props & {
        title: p.Property<string>,
        description: p.Property<string>,
        layout: p.Property<string>,
        value: p.Property<string>,
        value2: p.Property<string>,
        plot_data: p.Property<any>,
        plot_x: p.Property<string>,
        plot_y: p.Property<string>,
        plot_color: p.Property<string>,
        plot_type: p.Property<string>,

    }
}

export interface StatsPlotCard extends StatsPlotCard.Attrs { }

// The Bokeh .ts model corresponding to the Bokeh .py model
export class StatsPlotCard extends HTMLBox {
    properties: StatsPlotCard.Props

    constructor(attrs?: Partial<StatsPlotCard.Attrs>) {
        super(attrs)
    }

    static __module__ = "panel.models.stats_plot_card"

    static init_StatsPlotCard(): void {
        this.prototype.default_view = StatsPlotCardView;

        this.define<StatsPlotCard.Props>({
            title: [p.String, ""],
            description: [p.String, ""],
            layout: [p.String, "column"],
            value: [p.String, ""],
            value2: [p.String, ""],
            plot_data: [ p.Any, ],
            plot_x: [p.String, "x"],
            plot_y: [p.String, "y"],
            plot_color: [p.String, "firebrick"],
            plot_type: [p.String, "bar"],
        })
    }
}