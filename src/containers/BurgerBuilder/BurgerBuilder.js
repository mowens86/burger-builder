import React, { useState, useEffect } from 'react';
import Auxiliary from '../../hoc/Auxiliary/Auxiliary';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import axios from '../../axios-orders';

import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

const burgerBuilder = props => {
    // constructor(props) {
    //     super(props);
    //     this.state = {...}
    // }
    const [ purchasing, setPurchasing ] = useState(false);

    const { onInitIngredients } = props;
    useEffect(() => {
        onInitIngredients();
    }, [ onInitIngredients ]);

    const updatePurchaseState = (ingredients) => {
        const sum = Object.keys(ingredients)
            .map(igKey => {
                return ingredients[igKey]
            })
            .reduce((sum, el) => {
                return sum + el;
            }, 0);
        return sum > 0;
    }

    const purchaseHandler = () => {
        if (props.isAuthenticated) {
            setPurchasing(true);
        } else {
            props.onSetRedirectPath('/checkout');
            props.history.push('/auth');
        }  
    };

    const purchaseCancelHandler = () => {
        setPurchasing(false);
    };

    const purchaseContinueHandler = () => {
        // alert('You Continue!');
        props.onInitPurchase();
        props.history.push('/checkout');
    };

        const disabledInfo = {
            ...props.ings
        };
        for (let key in disabledInfo) {
            disabledInfo[key] = disabledInfo[key] <= 0;
        }

        let orderSummary = null;
        let burger = props.error ? <p>Ingredients can't be loaded...</p> : <Spinner />;

        if (props.ings) {
            burger = (                
                <Auxiliary>
                    <Burger ingredients={props.ings}/>
                    <BuildControls 
                        ingredientAdded={props.onIngredientAdded}
                        ingredientRemoved={props.onIngredientRemoved}
                        disabled={disabledInfo}
                        price={props.price}
                        purchaseable={updatePurchaseState(props.ings)}
                        ordered={purchaseHandler} 
                        isAuth={props.isAuthenticated} />
                </Auxiliary>
                        );
            orderSummary =                     
            <OrderSummary 
                ingredients={props.ings}
                purchaseCancelled={purchaseCancelHandler}
                purchaseContinued={purchaseContinueHandler}
                price={props.price}/>
        }
        // {salad: true, meat: false, ...} etc.
        return(
            <Auxiliary>
                <Modal show={purchasing} modalClosed={purchaseCancelHandler}>
                    {orderSummary}
                </Modal>
                {burger}
            </Auxiliary>
        );    
}

const mapStateToProps = state => {
    return {
        ings: state.burgerBuilder.ingredients,
        price: state.burgerBuilder.totalPrice,
        error: state.burgerBuilder.error,
        isAuthenticated: state.auth.token !== null
    };
}

const mapDispatchToProps = dispatch => {
    return {
        onIngredientAdded: (ingName, tPrice) => dispatch(actions.addIngredient(ingName)),
        onIngredientRemoved: (ingName, tPrice) => dispatch(actions.removeIngredient(ingName)),
        onInitIngredients: () => dispatch(actions.initIngredients()),
        onInitPurchase: () => dispatch(actions.purchaseInit()),
        onSetRedirectPath: (path) => dispatch(actions.setAuthRedirectPath(path))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withErrorHandler(burgerBuilder, axios));