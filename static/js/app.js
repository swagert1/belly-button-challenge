const url = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json";

// Promise Pending
const dataPromise = d3.json(url);
console.log("Data Promise: ", dataPromise);

//Creating a globally accessible variable, selectMenu, for the dropdown menu
//let selectMenu = d3.select("#Menu").append("select").attr("id", "selectMenu"); => this would be used if we were referenceing a <div> .html object
let selectMenu = d3.select('#Menu');


//Import the data and assign them to a variable called data
dataPromise.then(
    function(result){
    data = result;

    //Populate our dropdown list with all of the subject ID's
    populateList();

    //ititalize the dashboard outputs with the first entry in our dataset
    updateDashboard(data.names[0]);
    
    //When a new ID is selected, it will be sent to our updateDashboard function
    newSelection();
});

function populateList()
{
    data.names.forEach(
        function(id) {
            selectMenu
                .append("option")
                .attr("value", id)
                .text(id);
            });
};

function newSelection(){
    selectMenu.on("change",
    function() {
        let newID = this.value; //or, this could be our d3.event.target.value
        updateDashboard(newID);
    });

}

function updateBarChart(dataArray){
    
    let sortedByOTU = dataArray.sort((a, b) => b.sample_value - a.sample_value);
    top10OTU = sortedByOTU.slice(0, 10).reverse();
    
    let trace = {
        x: top10OTU.map(object => object.sample_value), //Since we are using a horizontal chart, we need to flip the x and y
        y: top10OTU.map(object => `OTU ID ${object.otu_id}`),
        text: top10OTU.map(object => object.otu_label),
        type: "bar",
        orientation: "h"
      };

      let traceData = [trace];

      let layout = {
        title: "Top 10 OTU",
      };

    Plotly.newPlot("bar", traceData, layout);
    
}

function updateBubblePlot(dataArray){

    var trace = {
        x: dataArray.map(object => object.otu_id),
        y: dataArray.map(object => object.sample_value),
        text: dataArray.map(object => object.otu_label),
        mode: 'markers',
        marker: {
          color: dataArray.map(object => object.otu_id),
          size: dataArray.map(object => object.sample_value),
          colorscale: 'Earth'
        }
      };
      
      var data = [trace];

      var layout = {
        title: 'OTU Bubble Chart',
        showlegend: false,
        height: 600,
        width: 1200
      };

    Plotly.newPlot('bubble', data, layout);
}

function updateDial(wfreq){
    var data = [
        {
            domain: { x: [0, 1], y: [0, 1] },
            value: wfreq,
            title: { text: "Wash frequency per week"},
            type: "indicator",
            mode: "gauge+number",
            colorscale: 'Greens',
            gauge: {
                axis: { range: [0, 10]}
            }
        }
    ];
    
    var layout = { 
        width: 600, 
        height: 500, 
        margin: { t: 0, b: 0 } 
    };

    Plotly.newPlot('gauge', data, layout);
}

function udpateDemographic(metadata){
    demoDisp = d3.select('#sample-metadata');
    demoDisp.html(`Ethnicity: ${metadata.ethnicity}<br>
    Sex: ${metadata.gender}<br>
    Age: ${metadata.age}<br>
    Location: ${metadata.location}<br>
    BBtype: ${metadata.bbtype}<br>
    Wfreq: ${metadata.wfreq}`)
}

function updateDashboard(selID) 
{
    //setup arrays to carry the id names, metadata, and samples properties
    let names = data.names;
    let meta = data.metadata;
    let samples = data.samples;

    //get the sample data from the selected id
    let arrayIndex = names.findIndex(val => val === selID);
    let otu_ids = samples[arrayIndex].otu_ids;
    let otu_labels = samples[arrayIndex].otu_labels;
    let sample_values = samples[arrayIndex].sample_values;

    //get the metadata for the selected id
    let metadata = data.metadata[arrayIndex];

    //create an array holding the data for the selected id to pass to our graphing functions (hold on to this code for future)
    
    dataArray = [];
    for (let i = 0; i < otu_ids.length; i++) {
        entry = {};
        entry.otu_id = otu_ids[i];
        entry.otu_label = otu_labels[i];
        entry.sample_value = sample_values[i];
        dataArray.push(entry);
    }

    let wfreq = metadata.wfreq;
    
    udpateDemographic(metadata);

    updateBarChart(dataArray);

    updateBubblePlot(dataArray);

    updateDial(wfreq)
        
}
