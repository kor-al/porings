class FactsBox{

    constructor(opts) {
        // load in arguments from config object
        this.element = opts.element;
        this.facts_data = opts.facts_data;
        // this.facts_data = opts.facts_data;
        this.FactsCols = ['passive', 'looter', 'boss', 'other'] ;
        this.create();
    }

    create(){
        this.width = this.element.offsetWidth;
        this.height = this.element.offsetHeight;

        var div = d3.select(this.element);

        // this.text = div.append('p').classed('factText', true).append("text");
        this.text = div.select('.factText');
        this.start_text = this.text.html();
        this.list = div.append('div').classed('factList-container', true).append('ul').classed('factList', true);
    }

    update(data){

        this.list.html("");
        const mob_facts = this.facts_data[data['name']];
        this.text.html(mob_facts['facts']);

        if(mob_facts['passive'] == 1) this.list.append('li').append("text").text('passive');
        if(mob_facts['passive'] == 0) this.list.append('li').append("text").text('agressive');
        if(mob_facts['looter'] == 1) this.list.append('li').append("text").text('looter');
        if(mob_facts['boss'] == 1) this.list.append('li').append("text").text('boss');
        if(mob_facts['other']) this.list.append('li').append("text").text(mob_facts['other']);

    }

    reset()
    {
        // this.text = this.text.html(this.start_text);
        // this.text.html("");
        this.text.html(this.start_text)
        this.list.html("");
    }


}