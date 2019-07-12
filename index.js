import React, { Component } from 'react';
import InputDate from '@volenday/input-date';

// ant design
import { Button, Input, Popover } from 'antd';

export default class InputUrl extends Component {
	initialState = { hasChange: false, isPopoverVisible: false, localValue: '', isFocused: false };
	state = { ...this.initialState, initialState: this.initialState };

	static getDerivedStateFromProps(nextProps, prevState) {
		// Set initial localValue
		if (nextProps.value && !prevState.localValue) {
			return { ...prevState, localValue: nextProps.value };
		}

		// Resets equivalent value
		if (prevState.localValue !== nextProps.value) {
			// For Add
			if (typeof nextProps.value === 'undefined' && !prevState.hasChange && !prevState.isFocused) {
				return { ...prevState.initialState };
			}

			// For Edit
			if (!prevState.isFocused) {
				return { ...prevState.initialState, localValue: nextProps.value };
			}
		}

		return null;
	}

	handleChange = value => {
		this.setState({ localValue: value, hasChange: true });
	};

	handlePopoverVisible = visible => {
		this.setState({ isPopoverVisible: visible });
	};

	renderInput() {
		const {
			disabled = false,
			id,
			label = '',
			onChange,
			placeholder = '',
			required = false,
			styles = {},
			value = ''
		} = this.props;

		return (
			<Input
				allowClear
				autoComplete="off"
				disabled={disabled}
				name={id}
				placeholder={placeholder || label || id}
				required={required}
				size="large"
				style={styles}
				type="url"
				onBlur={e => {
					if (e.target.value != value) onChange(id, e.target.value);

					this.setState({ isFocused: false });
				}}
				onChange={e => {
					if (this.state.localValue != '' && e.target.value == '') onChange(id, e.target.value);

					this.handleChange(e.target.value);
				}}
				onFocus={e => {
					this.setState({ isFocused: true });
				}}
				onPressEnter={e => {
					onChange(id, e.target.value);
					return true;
				}}
				value={this.state.localValue || ''}
			/>
		);
	}

	renderPopover = () => {
		const { isPopoverVisible } = this.state;
		const { id, label = '', historyTrackValue = '', onHistoryTrackChange } = this.props;

		return (
			<Popover
				content={
					<InputDate
						id={id}
						label={label}
						required={true}
						withTime={true}
						withLabel={true}
						value={historyTrackValue}
						onChange={onHistoryTrackChange}
					/>
				}
				trigger="click"
				title="History Track"
				visible={isPopoverVisible}
				onVisibleChange={this.handlePopoverVisible}>
				<span class="float-right">
					<Button
						type="link"
						shape="circle-outline"
						icon="warning"
						size="small"
						style={{ color: '#ffc107' }}
					/>
				</span>
			</Popover>
		);
	};

	render() {
		const { hasChange } = this.state;
		const { id, label = '', required = false, withLabel = false, historyTrack = false } = this.props;

		if (withLabel) {
			if (historyTrack) {
				return (
					<div className="form-group">
						<span class="float-left">
							<label for={id}>{required ? `*${label}` : label}</label>
						</span>
						{hasChange && this.renderPopover()}
						{this.renderInput()}
					</div>
				);
			}

			return (
				<div className="form-group">
					<label for={id}>{required ? `*${label}` : label}</label>
					{this.renderInput()}
				</div>
			);
		} else {
			if (historyTrack) {
				return (
					<div class="form-group">
						{hasChange && this.renderPopover()}
						{this.renderInput()}
					</div>
				);
			}

			return this.renderInput();
		}

		return null;
	}
}
