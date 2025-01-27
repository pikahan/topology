/* eslint-disable react/require-default-props */
import React from 'react';
import _ from 'lodash';
import {
    IPosition,
    ITopologyContext,
    ITopologyLine,
    LineEditType,
    ITopologyData,
} from '../../declare';
import { Consumer } from '../context';
import { computeLinePath, computeTrianglePath } from '../../utils';
import config from '../../config';
import './index.less';


const Colors = { ACTIVE: '#1F8CEC', NORMAL: '#AAB7C4' };

interface ILineProps {
    start: IPosition;
    end: IPosition;
    color?: string;
    lineOffsetY?: number;
    data?: ITopologyLine;
    arrow?: boolean;
    readOnly?: boolean;
    context?: ITopologyContext;
    selected?: boolean;
    highLight?: boolean;
    onSelect?: (data: ITopologyData) => void;
    scaleNum?: number;
}

interface ILineState {
    hover: boolean;
}

class Line extends React.Component<ILineProps, ILineState> {
    state: ILineState = { hover: false };

    handleMouseEnter = () => {
        this.setState({ hover: true });
    }

    handleMouseLeave = () => {
        this.setState({ hover: false });
    }

    handleClick = (e: React.MouseEvent<SVGPathElement, MouseEvent>) => {
        const {
            selected,
            context,
            data,
            onSelect,
        } = this.props;
        const { lines } = context.selectedData;
        const multi = e.metaKey || e.ctrlKey;
        if (!onSelect) {
            return;
        }

        if (!multi) {
            onSelect({
                lines: selected ? [] : [data],
                nodes: [],
            });
            return;
        }
        onSelect({
            ...context.selectedData,
            lines: selected
                ? lines.filter(item => !_.isEqual(item, data))
                : [...lines, data],
        });
    }

    render() {
        const {
            start,
            end,
            selected,
            highLight,
            data,
            readOnly,
            lineOffsetY,
            context: { linking, activeLine },
        } = this.props;

        const { hover } = this.state;
        const dataJson = data ? JSON.stringify({ origin: data, po: { start, end } }) : '';
        const getTriangleStart = () => ({ ...end, y: end.y - config.line.triangleWidth });
        // 只高亮新增或者编辑的当前线
        const curLinking = linking && !activeLine.origin && !data;
        const lColor = highLight || selected || hover || curLinking ? Colors.ACTIVE : ((data && data.color) || Colors.NORMAL);
        const transition = linking ? 'none' : config.transition;
        return (
            <React.Fragment>
                <path
                    onClick={this.handleClick}
                    strokeWidth={config.line.triggerWidth}
                    stroke="transparent"
                    fill="none"
                    style={{ pointerEvents: 'all', transition }}
                    d={computeLinePath(start, getTriangleStart(), lineOffsetY)}
                    onMouseEnter={this.handleMouseEnter}
                    onMouseLeave={this.handleMouseLeave}
                />
                <path
                    onClick={this.handleClick}
                    strokeWidth={highLight || selected || hover ? config.line.strokeLargeWidth : config.line.strokeWidth}
                    stroke={lColor}
                    fill="none"
                    style={{ pointerEvents: 'all', transition }}
                    d={computeLinePath(start, getTriangleStart(), lineOffsetY)}
                    onMouseEnter={this.handleMouseEnter}
                    onMouseLeave={this.handleMouseLeave}
                />
                <path
                    className={readOnly ? '' : 'byai-topology-line-end-triangle'}
                    fill={lColor}
                    stroke="none"
                    data-type={LineEditType.EDIT_END}
                    data-json={dataJson}
                    style={{ pointerEvents: 'all', transition }}
                    d={computeTrianglePath(getTriangleStart(), config.line.triangleWidth)}
                    onMouseEnter={this.handleMouseEnter}
                    onMouseLeave={this.handleMouseLeave}
                />
            </React.Fragment>
        );
    }
}

export default (props: ILineProps) => (
    <Consumer>
        {context => <Line {...props} context={context} />}
    </Consumer>
);
