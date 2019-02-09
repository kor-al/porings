class FactsBox{

    constructor(opts) {
        // load in arguments from config object
        this.element = opts.element;
        this.FactsCols = ['passive', 'looter', 'boss', 'other'] ;
        this.create();
    }

    create(){
        this.width = this.element.offsetWidth;
        this.height = this.element.offsetHeight;

        var div = d3.select(this.element);

        this.text = div.append('p').classed('factText', true).append("text");
        this.list = div.append('div').classed('factList-container', true).append('ul').classed('factList', true);
    }

    update(data){
        console.log(data['facts'])
        this.reset()
        this.text.text(data['facts']);

        if(data['passive'] == 1) this.list.append('li').append("text").text('passive');
        if(data['passive'] == 0) this.list.append('li').append("text").text('agressive');
        if(data['looter'] == 1) this.list.append('li').append("text").text('looter');
        if(data['boss'] == 1) this.list.append('li').append("text").text('boss');
        if(data['other']) this.list.append('li').append("text").text(data['other']);

    }

    reset()
    {
        this.text.text("");
        this.list.html("");
    }


}