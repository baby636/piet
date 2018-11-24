/**
 * this file is part of bundesblock-voting
 *
 * it is subject to the terms and conditions defined in
 * the 'LICENSE' file, which is part of the repository.
 *
 * @author Heiko Burkhardt
 * @copyright 2018 by Slock.it GmbH
 */

import * as React from 'react';
import * as Sol from '../../../solidity-handler/SolidityHandler';
import { Conversion, Convert } from '../../../solidity-handler/TypeConversion';
import Web3Type from '../../../types/web3';
import * as CsvParse from 'csv-parse';
import * as PromiseFileReader from 'promise-file-reader';
import SplitPane from 'react-split-pane';
import { Eth } from '../../../types/types';
import { UICreationHandling, Row, Element } from './UIStructure';

interface UICreationViewProps {
    web3: Web3Type;
    content: any;
    viewId: number;
    tabId: number;
    uiCreationHandling: UICreationHandling;
}

interface UICreationViewState {
    showMetaInformation: boolean;
    results: string[];
}

export class UICreationView extends React.Component<UICreationViewProps, UICreationViewState> {

    constructor(props: UICreationViewProps) {
        super(props);

        this.state = {
            showMetaInformation: true,
            results: []
        };

    }

    async call(abi: any, contractAddress: string, functionName: string): Promise<void> {

        const contract: any = new this.props.web3.eth.Contract(abi, contractAddress);

        let result: any; 
        try {
            result = await contract.methods[functionName]().call();
            result = typeof result === 'object' ? JSON.stringify(result) : result.toString();
        } catch (e) {
            result = e;
        }  

        this.setState((prev: UICreationViewState) => {
            prev.results[functionName] = result.toString();
            return {
                reuslts: prev.results
            } as any;
        });
    }

    updateAll(): void {
        this.props.uiCreationHandling.uiStructure.rows
            .forEach((row: Row) => 
                row.elements.forEach((element: Element) => 
                    this.call(element.abi, element.contractAddress, element.data)
                )
            );
    }

    componentDidMount(): void {
        this.updateAll();
    }

    componentWillReceiveProps(): void {
        this.updateAll();
    }

    render(): JSX.Element {

        const rows: JSX.Element[] = this.props.uiCreationHandling.uiStructure.rows
            .map((row: Row, index: number) => {
                const elements: JSX.Element[] = row.elements.map((element: Element) => 
                    <div className='col-sm'>
                        <div className='card'>
                            <div className='card-body'>
                                <span className='text-muted'><small>{element.data}</small></span>
                                <p className='card-text'>{this.state.results[element.data] && this.state.results[element.data] }</p>
                            </div>
                        </div>
                    </div>
                );
                return <div>
                    {this.state.showMetaInformation &&
                     <div key={'row' + index} className='row'>
                        <div className='col-sm'>
                            <span className='badge badge-secondary'>Row {index}</span>
                        </div>
      
                    </div>
                    }
                    <div key={'row' + index} className='row'>
           
                        {elements}
                    </div>
                </div>;
 
            }); 
            
        return <SplitPane className='scrollable hide-resizer' split='horizontal'  defaultSize={40} allowResize={false} >
        <div className='h-100 w-100 toolbar'>
             <button 
                title='Create Value Box Container'
                className='btn btn-sm btn-outline-info'
                onClick={this.props.uiCreationHandling.addRow}
            >
                New Row
            </button>

        </div>
        <SplitPane 
            className='scrollable hide-resizer empty-first-pane  ui-creation-main' 
            split='horizontal'
            defaultSize={1}
            allowResize={false}
        >
        <div className='container'>
            {rows}
        </div>
            
        </SplitPane>
    </SplitPane>;
               
    }
    
}