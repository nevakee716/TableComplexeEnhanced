| **Name** | **TableComplexeEnhanced** | **Version** | 
| --- | --- | --- |
| **Updated by** | Mathias PFAUWADEL | 1.2 | 

## Patch Notes

* 1.2 : Allow you to rename the label of a column
* 1.1 : Boolean property are now, display as check and cross in tableComplexe AND propertyGroup
* 1.0 : 1st version working

## TBD

* More Options

## Description 
Allow you have option when displaying a tableComplexe(title, size of the table, size and order of column, disable all filter in one click.. )


## Screen Shot

<img src="https://raw.githubusercontent.com/nevakee716/TableComplexeEnhanced/master/screen/1.png" alt="Drawing" style="width: 95%;"/>


## Options 

(to be configure in C:\Casewise\Evolve\Site\bin\webDesigner\custom\Marketplace\libs\TableComplexeEnhanced\src\TableComplexeEnhanced.js)
```
  var TableComplexeEnhancedConfig = {
    itemPerPages : [5, 12, 42,9999],
    title : true,
    clearFilterAtStart : true,
    clearButtonName : 'Clear All Filters',
    exigence_grid : {
      heightPercent : 2,
      column : {
        1 : {order : 7,size : 200},
        2 : {order : 3,size : 200},
        3 : {order : 2,size : 200},
        7 : {order : 1,size : 400} 
      }
    },
    organisation_1624544826 : {
      heightPercent : 2,
      column : {
        1 : {order : 4,size : 100, name: "newname"},
        2 : {order : 1,size : 200},
        4 : {order : 2,size : 200} 
      }
    }    
  };
```


### Item Per Pages:
    
`    itemPerPages : [5, 12, 42,9999],`
Use the line to configure the number of items per pages. When you ``arrive on the page, the number of item per page will always be 50.

### Title:

`    title : true,`
Put true if you want the title to be display, the title will be the nodeName.

### clearFilterAtStart:

`    clearFilterAtStart : true,`
Put true, if you want the column filter to be cleared at start

### clear Button Name:

`clearButtonName : 'Clear All Filters',`
Choose the label of the Clear filter button

### Column order, size and label:

You can choose to change the order of the columns, their size and their label for a selected node.

``` exigence_grid : {
      heightPercent : 2,
      column : {
        1 : {order : 7,size : 200,, name: "newname"},
        2 : {order : 3,size : 200},
        3 : {order : 2,size : 200},
        7 : {order : 1,size : 400} 
      }
    },
    organisation_1624544826 : {
      heightPercent : 2,
      column : {
        1 : {order : 4,size : 100},
        2 : {order : 1,size : 200},
        4 : {order : 2,size : 200} 
      }
    }      
```

In this exemple, exigence_grid and organisation_1624544826 are the nodeID of the tableComplexe we want to apply change order

### Height of a table complexe:

You can modify the height of a table with heightPercent.

```    organisation_1624544826 : {
      heightPercent : 2,
      column : {
        1 : {order : 4,size : 100},
        2 : {order : 1,size : 200},
        4 : {order : 2,size : 200} 
      }
    }      
```

You can modify the height of a table to take for exemple half the size of your page, put heightPercent  at 2.

## Cohabitation with other specific

Here is a list of all the specific and the function they modified. If you have other personnal specific that use the same function, you will need to merge them in to the main.js
https://docs.google.com/spreadsheets/d/19Mi3LsdQlRuTGFAZiGtLFPGcLhrScWZFTSsm-qQ_BiY/edit#gid=0



